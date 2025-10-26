# Flask_App.py
import os
import sys
from datetime import datetime
from flask import Flask, request, render_template, jsonify, redirect, url_for, flash, Response
from flask_login import (
    LoginManager,
    login_user,
    login_required,
    logout_user,
    current_user,
    UserMixin,
)
from sqlalchemy import create_engine, Integer, String, Text, DateTime, ForeignKey, or_
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session
from openai import OpenAI

print(">>> PY:", sys.executable)
print(">>> CWD:", os.getcwd())
print(">>> FILE:", __file__)

app = Flask(__name__)
# Secret key for session/auth (read from env or fallback)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "dev-secret-change-me")
file_path = ""


def load_env_files():
    """Load key=value lines from .env (preferred) or .env.example (fallback)."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    for name in [".env", ".env.example"]:
        path = os.path.join(base_dir, name)
        if not os.path.exists(path):
            continue
        try:
            with open(path, "r", encoding="utf-8") as f:
                for raw in f:
                    line = raw.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k and os.environ.get(k) is None:
                        os.environ[k] = v
            break
        except Exception:
            pass 

load_env_files()

# ---------------------------
# Database setup (PostgreSQL)
# ---------------------------

class Base(DeclarativeBase):
    pass


class User(Base, UserMixin):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    histories: Mapped[list["History"]] = relationship("History", back_populates="user")


class History(Base):
    __tablename__ = "histories"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    item_type: Mapped[str] = mapped_column(String(32))  # solutions|structure|terraform|cli
    provider: Mapped[str] = mapped_column(String(64), default="")
    scale: Mapped[str] = mapped_column(String(64), default="")
    loading: Mapped[str] = mapped_column(String(64), default="")
    country: Mapped[str] = mapped_column(String(128), default="")
    prompt_text: Mapped[str] = mapped_column(Text)
    result_text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship("User", back_populates="histories")


def _build_db_url_from_env() -> str:
    host = os.environ.get("DB_HOST", "localhost")
    port = os.environ.get("DB_PORT", "5432")
    user = os.environ.get("DB_USER", "postgres")
    password = os.environ.get("DB_PASSWORD", "postgres")
    name = os.environ.get("DB_NAME", "devops_advisor_db")
    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{name}"


DB_URL = os.environ.get("DATABASE_URL", _build_db_url_from_env())
engine = create_engine(DB_URL, pool_pre_ping=True)

# Create tables if they don't exist
try:
    Base.metadata.create_all(engine)
except Exception as _e:
    print(">>> WARNING: Could not create tables:", _e)

# ---------------------------
# Auth setup (Flask-Login)
# ---------------------------
login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id: str):
    try:
        with Session(engine) as s:
            return s.get(User, int(user_id))
    except Exception:
        return None

providers = ["AWS", "Azure", "Google Cloud"]
scales = ["Small (<1k/day)", "Medium (1k-100k/day)", "Large (>100k/day)"]
loading_pressure = ["Everyday", "3-5 days in week", "No loading pressure"]


def build_region_accuracy_rules(provider: str | None, country: str | None = None) -> str:
    """Return a short instruction block to keep region recommendations accurate.

    - Never suggest regions a provider doesn't offer.
    - Specific guardrails (e.g., Azure has no Bahrain region, AWS does).
    """
    p = (provider or "").strip().lower()
    c = (country or "").strip()

    rules: list[str] = [
        "Do NOT list regions that the selected provider does not actually offer.",
        "If a requested region is unavailable, clearly state it's not available for this provider and recommend the nearest supported regions instead.",
    ]

    if p == "azure":
        # User highlighted this specifically; enforce it in the prompt to avoid hallucinations.
        rules.append(
            "Azure does not have a Bahrain region. Do not recommend 'Bahrain' for Azure; instead suggest nearby Azure regions (for example 'UAE North' or 'Qatar Central') and explicitly note Bahrain is not an Azure region when relevant."
        )
    elif p == "aws":
        # Useful contrast to avoid removing Bahrain when AWS is selected.
        rules.append("AWS includes the Bahrain region (me-south-1). Use it when appropriate.")
    elif p in ("google cloud", "gcp", "google"):
        rules.append(
            "Google Cloud does not have a Bahrain region. Use valid GCP regions in the Middle East such as 'me-central2' (Dammam, Saudi Arabia), 'me-central1' (Doha, Qatar), or 'me-west1' (Tel Aviv, Israel). When the user's country is Saudi Arabia, prefer 'me-central2' (Dammam) for proximity/latency unless other constraints apply."
        )

    return "\nProvider region accuracy rules:\n- " + "\n- ".join(rules) + "\n"

@app.route("/", methods=["GET"])
@login_required
def index():
    return render_template(
        "i.html",
        providers=providers,
        scales=scales,
        loading_pressure=loading_pressure,
    )


@app.route("/history_page", methods=["GET"])
@login_required
def history_page():
    """Render the dedicated history page"""
    return render_template("history.html")


@app.route("/auth/register", methods=["GET", "POST"])
def register():
    from werkzeug.security import generate_password_hash

    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        password = request.form.get("password") or ""
        if not email or not password:
            flash("Email and password are required", "error")
            return redirect(url_for("register"))
        try:
            with Session(engine) as s:
                if s.query(User).filter_by(email=email).first():
                    flash("Email already registered", "error")
                    return redirect(url_for("login"))
                u = User(email=email, password_hash=generate_password_hash(password))
                s.add(u)
                s.commit()
                flash("Registration successful. Please log in.", "success")
                return redirect(url_for("login"))
        except Exception as e:
            flash(f"Registration failed: {e}", "error")
            return redirect(url_for("register"))
    return render_template("login.html", mode="register")


@app.route("/auth/login", methods=["GET", "POST"])
def login():
    from werkzeug.security import check_password_hash

    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        password = request.form.get("password") or ""
        try:
            with Session(engine) as s:
                u = s.query(User).filter_by(email=email).first()
                if not u or not check_password_hash(u.password_hash, password):
                    flash("Invalid email or password", "error")
                    return redirect(url_for("login"))
                login_user(u)
                return redirect(url_for("index"))
        except Exception as e:
            flash(f"Login failed: {e}", "error")
            return redirect(url_for("login"))
    return render_template("login.html", mode="login")


@app.route("/auth/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))

@app.route("/best_practices_cost", methods=["POST"])
@login_required
def best_practices_cost():
    provider = request.form.get("provider")
    description = request.form.get("description", "")
    scale = request.form.get("scale", scales[0])
    loading = request.form.get("loading_pressure", loading_pressure[0])
    country = request.form.get("country", "").strip()

    # Higher scale and higher loading pressure should increase cost estimates.
    try:
        scale_factors = {
            scales[0]: 1.0,  # Small
            scales[1]: 2.0,  # Medium
            scales[2]: 3.0,  # Large
        }
        pressure_factors = {
            # Note: loading_pressure ordering is ["Everyday", "3-5 days in week", "No loading pressure"]
            loading_pressure[2]: 1.0,  # No loading pressure
            loading_pressure[1]: 1.5,  # 3-5 days in week
            loading_pressure[0]: 2.0,  # Everyday
        }
    except Exception:
        scale_factors = {scale: 1.0}
        pressure_factors = {loading: 1.0}

    scale_factor = scale_factors.get(scale, 1.0)
    pressure_factor = pressure_factors.get(loading, 1.0)
    combined_multiplier = round(scale_factor * pressure_factor, 2)

    load_env_files()

    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        return (
            jsonify(
                {
                    "error": (
                        "OPENAI_API_KEY not set. "
                        "Add it to a .env file (preferred) or .env.example in the project root, "
                        "or export it in your shell."
                    )
                }
            ),
            400,
        )

    client = OpenAI(api_key=openai_key)
    print(f">>> OPENAI_API_KEY present: True (length={len(openai_key)})")

    # Build region context
    region_context = ""
    if country:
        region_context = f"""
**CRITICAL: USER'S COUNTRY/REGION**: {country}

Based on the user's location ({country}), you MUST provide:
1. **TOP 3 RECOMMENDED REGIONS** for {provider} that offer the BEST COST-TO-PERFORMANCE ratio for users in {country}
   - Consider: proximity/latency, regional pricing differences, data sovereignty, available services
   - Rank them: #1 (Best), #2 (Alternative), #3 (Fallback)
   - For each region, explain WHY it's recommended (latency, cost, compliance)

2. **COST COMPARISON BY REGION**: Show the cost range (min-max in SAR) for EACH of the 3 recommended regions
   - Region pricing varies significantly (some regions are 20-40% more expensive)
   - Be specific: "Region A: SAR X,XXX - SAR Y,YYY/month"
   - Highlight which region offers the best value

Format this as the FIRST section of your response.
"""
    else:
        region_context = ""

    influence_context = f"""
Things that strongly influence cost:
1) The greater the pressure, the greater the cost.
2) The greater the scale, the greater the cost.

Apply the following numeric influence when producing SAR estimates:
- Scale: {scale} → factor {scale_factor:.2f}
- Loading pressure: {loading} → factor {pressure_factor:.2f}
- Combined cost multiplier: {combined_multiplier:.2f}

You MUST apply the combined cost multiplier to all SAR minimum/maximum estimates and to each
service category proportionally. First base ranges on realistic {provider} pricing, then scale by
this multiplier to reflect the user's scale and loading pressure.
"""

    prompt = f"""
You are an expert DevOps and Cloud Cost Optimization consultant specializing in {provider}.

Context:
- Cloud provider: {provider}
- Expected scale tier: {scale}
- Loading pressure / request pattern: {loading}
- Project description: {description}
{region_context}

{build_region_accuracy_rules(provider, country)}

{influence_context}

Your task is to provide **COST OPTIMIZATION BEST PRACTICES ONLY** - NO CODE, NO CONFIGURATIONS, NO TERRAFORM, NO CI/CD PIPELINES.

Focus exclusively on cost optimization:

### 1. REGIONAL COST OPTIMIZATION (if country provided)
{f"Provide the TOP 3 cost-optimized {provider} regions for users in {country} with detailed cost ranges for each region in SAR." if country else "Skip this section if no country is provided."}

### 2. COST-EFFICIENT ARCHITECTURE RECOMMENDATIONS
Recommend the most cost-effective services and architectural patterns for {provider} based on the scale tier:
- For Small scale: Emphasize serverless, pay-per-use, and managed services to minimize operational overhead
- For Medium scale: Balance between cost and performance with autoscaling and caching strategies
- For Large scale: Focus on reserved instances, committed use discounts, and multi-region optimization

### 3. COST BREAKDOWN & ESTIMATES IN SAUDI RIYALS (SAR)
Based on the project description and scale, provide:
- **Minimum Monthly Cost (SAR)**: Most cost-optimized configuration
- **Maximum Monthly Cost (SAR)**: Peak usage with high availability
- Cost breakdown by service category:
  * Compute costs
  * Storage costs
  * Database costs
  * Network/bandwidth costs
  * Additional services (monitoring, backup, etc.)

Use realistic {provider} pricing converted to SAR (1 USD ≈ 3.75 SAR).
 IMPORTANT: After determining realistic baseline costs, multiply the min/max and each category
 by the combined cost multiplier of {combined_multiplier:.2f} derived from the user's
 scale and loading pressure inputs.

### 4. COST OPTIMIZATION BEST PRACTICES
List specific recommendations to reduce costs:
- Auto-scaling policies
- Resource scheduling (shutdown during off-hours)
- Reserved capacity vs on-demand
- Data transfer optimization
- Monitoring and alerting for cost anomalies
- Right-sizing recommendations
- Spot/preemptible instances where applicable
- Storage lifecycle policies

### 5. COST VS FEATURE TRADEOFFS
Explain key decisions:
- When to use premium vs standard tiers
- When to use managed vs self-managed services
- Reserved vs on-demand pricing strategies

### OUTPUT FORMAT:
- Use clear headings and bullet points
- NO code blocks, NO configuration examples, NO YAML/JSON/HCL
- Focus on WHAT to do and WHY, not HOW to implement
- Provide specific service names from {provider}
- Include realistic cost ranges in SAR with minimum and maximum estimates
{f"- START with the Regional Recommendations section showing the 3 best regions for {country}" if country else ""}

**IMPORTANT**: This is a cost-focused strategic advisory document. Keep it business-focused and decision-oriented.
""".strip()

    try:
        print(">>> Calling OpenAI for cost best practices (gpt-4o-mini)...")
        resp = client.chat.completions.create(
            model="gpt-4o-mini",  
            temperature=0.7,
            max_tokens=3000,
            messages=[
                {"role": "system", "content": "You are an expert Cloud Cost Optimization consultant. Provide strategic cost recommendations with SAR pricing without code or configurations."},
                {"role": "user", "content": prompt},
            ],
        )
        answer = (resp.choices[0].message.content or "").strip()
        if not answer:
            return jsonify({"error": "OpenAI returned an empty response."}), 502
    except Exception as e:
        return jsonify({"error": f"OpenAI request failed: {e}"}), 500

    # Save history for logged-in users
    try:
        if current_user.is_authenticated:
            with Session(engine) as s:
                h = History(
                    user_id=current_user.id,
                    item_type="cost",
                    provider=provider or "",
                    scale=scale or "",
                    loading=loading or "",
                    country=country or "",
                    prompt_text=description or "",
                    result_text=answer,
                )
                s.add(h)
                s.commit()
    except Exception as _e:
        print(">>> WARN: Failed to save cost history:", _e)

    return jsonify({"cost": answer})


@app.route("/best_practices_performance", methods=["POST"])
@login_required
def best_practices_performance():
    provider = request.form.get("provider")
    description = request.form.get("description", "")
    scale = request.form.get("scale", scales[0])
    loading = request.form.get("loading_pressure", loading_pressure[0])
    country = request.form.get("country", "").strip()

    load_env_files()

    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        return (
            jsonify(
                {
                    "error": (
                        "OPENAI_API_KEY not set. "
                        "Add it to a .env file (preferred) or .env.example in the project root, "
                        "or export it in your shell."
                    )
                }
            ),
            400,
        )

    client = OpenAI(api_key=openai_key)
    print(f">>> OPENAI_API_KEY present: True (length={len(openai_key)})")

    region_perf_context = ""
    if country:
        region_perf_context = f"""
**USER'S COUNTRY/REGION**: {country}

Consider regional performance factors:
- Recommend {provider} regions with lowest latency from {country}
- Explain impact of region selection on performance (latency, data residency, edge locations)
- Suggest multi-region strategies if applicable for high availability and performance
"""

    prompt = f"""
You are an expert DevOps and Cloud Performance Optimization consultant specializing in {provider}.

Context:
- Cloud provider: {provider}
- Expected scale tier: {scale}
- Loading pressure / request pattern: {loading}
- Project description: {description}
{region_perf_context}

{build_region_accuracy_rules(provider, country)}

Your task is to provide **PERFORMANCE OPTIMIZATION BEST PRACTICES ONLY** - NO CODE, NO CONFIGURATIONS, NO TERRAFORM, NO CI/CD PIPELINES.

Focus exclusively on performance optimization:

### 1. REGIONAL PERFORMANCE OPTIMIZATION (if country provided)
{f"Recommend the best {provider} regions for users in {country} based on latency, edge presence, and performance characteristics." if country else "Skip this section if no country is provided."}

### 2. COMPUTE PERFORMANCE OPTIMIZATION
Provide specific performance recommendations:
- Right-sizing for performance (CPU, memory, IOPS requirements based on scale and loading)
- Premium/compute-optimized SKUs when warranted
- Autoscaling strategies for handling traffic spikes
- Load balancing and traffic distribution
- Containerization and orchestration benefits (AKS/EKS/GKE)

### 3. STORAGE PERFORMANCE OPTIMIZATION
- Storage tier selection (Premium SSD vs Standard, IOPS provisioning)
- Caching strategies (Redis, CDN, application-level caching)
- Database read replicas for read-heavy workloads
- Content Delivery Networks (CDN) for static assets

### 4. NETWORK PERFORMANCE OPTIMIZATION
- CDN and edge locations for global performance
- Private endpoints and network latency reduction
- Traffic routing and geo-routing strategies
- Connection pooling and keep-alive optimizations

### 5. DATABASE PERFORMANCE OPTIMIZATION
- Query optimization and indexing strategies
- Read replicas and horizontal scaling
- Caching layers (Redis, Memcached)
- Connection pooling
- Database SKU selection for IOPS and throughput

### 6. APPLICATION-LEVEL PERFORMANCE
- Caching strategies (in-memory, distributed cache)
- Asynchronous processing and message queues
- API optimization and rate limiting
- Compression and minification

### 7. MONITORING & OBSERVABILITY FOR PERFORMANCE
- Application Performance Monitoring (APM) tools
- Real-time metrics and alerting
- Performance bottleneck identification
- Load testing and capacity planning

### 8. PERFORMANCE VS COST TRADEOFFS
Explain when to prioritize performance over cost:
- Premium vs standard tiers
- Over-provisioning for reliability
- Reserved capacity for predictable workloads

### OUTPUT FORMAT:
- Use clear headings and bullet points
- NO code blocks, NO configuration examples, NO YAML/JSON/HCL
- Focus on WHAT to do and WHY, not HOW to implement
- Provide specific service names from {provider}
- Explain performance impact quantitatively where possible (e.g., "reduces latency by 40%")
{f"- START with the Regional Performance section for {country}" if country else ""}

**IMPORTANT**: This is a performance-focused strategic advisory document. Keep it business-focused and decision-oriented.
""".strip()

    try:
        print(">>> Calling OpenAI for performance best practices (gpt-4o-mini)...")
        resp = client.chat.completions.create(
            model="gpt-4o-mini",  
            temperature=0.7,
            max_tokens=3000,
            messages=[
                {"role": "system", "content": "You are an expert Cloud Performance Optimization consultant. Provide strategic performance recommendations without code or configurations."},
                {"role": "user", "content": prompt},
            ],
        )
        answer = (resp.choices[0].message.content or "").strip()
        if not answer:
            return jsonify({"error": "OpenAI returned an empty response."}), 502
    except Exception as e:
        return jsonify({"error": f"OpenAI request failed: {e}"}), 500

    # Save history 
    try:
        if current_user.is_authenticated:
            with Session(engine) as s:
                h = History(
                    user_id=current_user.id,
                    item_type="performance",
                    provider=provider or "",
                    scale=scale or "",
                    loading=loading or "",
                    country=country or "",
                    prompt_text=description or "",
                    result_text=answer,
                )
                s.add(h)
                s.commit()
    except Exception as _e:
        print(">>> WARN: Failed to save performance history:", _e)

    return jsonify({"performance": answer})


@app.route("/structure", methods=["POST"])
def structure():
    provider = request.form.get("provider")
    description = request.form.get("description", "")
    scale = request.form.get("scale", scales[0])
    loading = request.form.get("loading_pressure", loading_pressure[0])

    load_env_files()

    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        return (
            jsonify(
                {
                    "error": (
                        "OPENAI_API_KEY not set. "
                        "Add it to a .env file (preferred) or .env.example in the project root, "
                        "or export it in your shell."
                    )
                }
            ),
            400,
        )

    client = OpenAI(api_key=openai_key)
    print(f">>> OPENAI_API_KEY present: True (length={len(openai_key)})")

    structure_prompt = f"""
You are an expert Software Architect and DevOps engineer specializing in {provider}.

**PRIMARY INPUT (90% weight) - Read every word carefully:**
Project description: {description}

Context:
- Cloud provider: {provider}
- Expected scale: {scale}
- Loading pressure: {loading}

YOUR MISSION:
Analyze the project description thoroughly and generate a COMPLETE, production-ready folder structure. Base 90% of your decisions on what the user wrote. If the description lacks infrastructure details (user may not know DevOps/cloud well), intelligently suggest best practices for {provider} that fit their application type.

INTELLIGENT INFERENCE RULES:
- If user mentions "web app" but no specifics → suggest appropriate frontend framework + backend + database
- If user mentions "database" without type → suggest PostgreSQL (most versatile) or MySQL based on use case
- If user mentions "API" without backend tech → suggest modern REST/GraphQL backend for {provider}
- If user mentions "mobile app" → suggest backend API + database + possibly blob storage for media
- If user mentions "authentication" → include identity/auth module in infrastructure
- If user mentions "files/images/uploads" → include object storage (S3/Blob/Cloud Storage)
- If user mentions "real-time" or "notifications" → suggest caching/Redis + message queue
- If containers not mentioned but app is modern → suggest containerization as best practice
- Always include monitoring, secrets management, and CI/CD unless user explicitly says otherwise

Generate a CLEAR, WELL-FORMATTED project folder structure tailored to the project description.

## FORMATTING RULES (CRITICAL - MUST FOLLOW EXACTLY):

1. **Use ONLY these tree characters**: ├──, └──, │
2. **Consistent spacing**: 4 spaces per indentation level
3. **Clear hierarchy**: Parent folders before children
4. **Comments**: Add concise comments using "  # " (two spaces then #). Keep comments ≤ 40 chars. Never wrap comments to a new line.
5. **File extensions**: Always include (.tf, .yml, .json, .js, .py, etc.)
6. **NO MARKDOWN**: Do NOT include triple backticks, code fences, or prose paragraphs. Output ONLY the tree lines.
7. **LINE LENGTH**: Keep each line ≤ 100 characters to avoid wrapping in UIs.
8. **ROOT NAME**: Always start with a single top-level folder named `project-root/` and put everything under it.

## SECTION ORDER (TOP → BOTTOM):
project-root/ → frontend/ (if any) → backend/ or services/ → terraform/ → .github/workflows/ (if any) → scripts/ → tests/ → docs/ → docker-compose.yml → README.md

## TERRAFORM STRUCTURE (MOST IMPORTANT, ADAPTIVE):

**If infrastructure provisioning is needed**, create a Terraform folder using the base layout below. The root files (main.tf, variables.tf, outputs.tf) are required, but under modules/ you must include only the modules that are actually needed for the described project. Omit any modules that are not relevant. Use conventional module names so downstream Terraform generation can rely on them.

```
terraform/
├── main.tf                      # Root configuration - calls all modules
├── variables.tf                 # Root-level input variables
├── outputs.tf                   # Root-level outputs
└── modules/                     # Reusable Terraform modules
    ├── networking/              # VPC/VNet, subnets, security groups
    │   ├── main.tf             # Networking resources definition
    │   ├── variables.tf        # Networking input variables
    │   └── outputs.tf          # Networking outputs (subnet_id, vpc_id)
    ├── compute/                 # AKS/EKS/GKE, VMs, App Service
    │   ├── main.tf             # Compute resources definition
    │   ├── variables.tf        # Compute input variables
    │   └── outputs.tf          # Compute outputs (cluster_id, endpoint)
    ├── database/                # Database resources (flexible servers, RDS, Cloud SQL)
    │   ├── main.tf             # Database resources definition
    │   ├── variables.tf        # Database input variables
    │   └── outputs.tf          # Database outputs (connection_string, db_id)
    ├── security/                # Key Vault/Secrets Manager, IAM/roles, policies
    │   ├── main.tf             # Security resources definition
    │   ├── variables.tf        # Security input variables
    │   └── outputs.tf          # Security outputs (keyvault_id, acr_id)
    ├── monitoring/              # Log Analytics/CloudWatch/Cloud Monitoring + APM wiring
    │   ├── main.tf             # Monitoring resources definition
    │   ├── variables.tf        # Monitoring input variables
    │   └── outputs.tf          # Monitoring outputs (workspace_id)
    ├── storage/                 # Storage accounts, S3 buckets, Cloud Storage
    │   ├── main.tf             # Storage resources definition
    │   ├── variables.tf        # Storage input variables
    │   └── outputs.tf          # Storage outputs (storage_id, bucket_name)
    ├── registry/                # Container registry (ACR/ECR/Artifact Registry)
    │   ├── main.tf             # Registry creation and RBAC
    │   ├── variables.tf        # Registry input variables
    │   └── outputs.tf          # Registry outputs (registry_id, login_server)
    ├── cdn/                     # CDN/Front Door/Cloud CDN for web/static
    │   ├── main.tf             # CDN profiles, endpoints/origins/rules
    │   ├── variables.tf        # CDN input variables
    │   └── outputs.tf          # CDN endpoint/hostname
    └── cache/                   # Redis Cache, ElastiCache, Memorystore
        ├── main.tf             # Cache resources definition
        ├── variables.tf        # Cache input variables
        └── outputs.tf          # Cache outputs (cache_endpoint)
```

**TERRAFORM MODULES TO INCLUDE** (based on project needs):
- **networking/** - ALWAYS include if using AKS/EKS/GKE or multi-tier apps
- **compute/** - Include for AKS, EKS, GKE, App Service, VMs, containers
- **database/** - Include if database is mentioned (PostgreSQL, MySQL, MongoDB, etc.)
- **security/** - Include for Key Vault/Secrets Manager, IAM roles/policies, secrets management
- **monitoring/** - Include if observability/logging is mentioned
- **storage/** - Include if file storage, backups, or object storage needed
- **cache/** - Include if Redis/caching layer is mentioned
- **registry/** - Include if containers are mentioned (grant pull to compute identity; disable admin on ACR)
- **cdn/** - Include if you expose static assets or a public web app and want global performance

PRODUCTION INFERENCE (GO BEYOND USER INPUT):
- If the description hints at containers, proactively add `registry/` and wire `compute` to pull images via identity/role (no admin passwords).
- If a public web or static site is implied, add `cdn/` in front of the app service/storage static website.
- Always pair databases with secrets management in `security/` and connect monitoring/APM via `monitoring/`.
- Prefer private networking (subnets, NSGs/SGs, private endpoints) when networking + database/storage exist.

## APPLICATION STRUCTURE (ADAPTIVE):
Infer the stack from the project description and generate ONLY the folders for the chosen technologies. Do NOT output multiple stacks; pick the best match and keep it consistent end‑to‑end.

### Frontend (generate only if a web/mobile UI is mentioned)
- Detect the framework and language: React, Next.js, Vue, Angular, Svelte, plain HTML, or mobile (React Native/Flutter). Also infer TypeScript vs JavaScript.
- Produce a clean, idiomatic structure for that framework. Examples of conventions to follow (pick ONE based on description):
    - React (JS/TS): `src/components/`, `src/pages/ or src/routes/`, `src/hooks/`, `src/context/`, entry (`src/main.tsx` or `src/index.jsx`), `public/`, `package.json`, `vite.config.*` or CRA config.
    - Next.js: prefer `app/` router for new projects, otherwise `pages/`; include `app/layout.tsx`, `app/page.tsx`, `next.config.js`, `public/`.
    - Vue 3 + Vite: `src/components/`, `src/views/`, `src/router/`, `src/store/`, `main.ts`, `vite.config.ts`.
    - Angular: standard CLI layout with `src/app/`, feature modules, `angular.json`.
    - Static site: `public/`, `assets/`, minimal `index.html`.
- Use proper file extensions: .tsx/.ts when TypeScript is implied; otherwise .jsx/.js.
- Include `.env` only if the framework supports runtime env injection; otherwise note build‑time env (e.g., NEXT_PUBLIC_*, Vite env files).

### Backend (generate only if an API/service is mentioned)
- Detect the backend stack and show the conventional structure for exactly one framework:
    - Node.js Express or NestJS
    - Python FastAPI/Flask/Django
    - Java Spring Boot
    - Go (Gin/Fiber)
    - .NET (minimal API or MVC)
- Follow community‑standard folder names for the selected stack. Examples of conventions to follow (pick ONE based on description):
    - Express: `src/routes/`, `src/controllers/`, `src/services/`, `src/models/`, `src/middleware/`, `src/config/`, `src/server.ts`.
    - NestJS: `src/modules/feature/`, `src/common/`, `src/main.ts`, `nest-cli.json`.
    - FastAPI: `app/api/routers/`, `app/core/`, `app/models/`, `app/services/`, `app/main.py`, `pyproject.toml` or `requirements.txt`.
    - Django: project folder + one app; `manage.py`, `settings.py`, `urls.py`, `apps/`.
    - Spring Boot: `src/main/java/...`, `src/main/resources/`, `pom.xml` or `build.gradle`.
    - Go: `cmd/service/main.go`, `internal/handlers`, `internal/services`, `internal/repository`, `go.mod`.
- Use `.env` only for local dev; keep secrets out of VCS.

### Multi‑service or monorepo
- If the description implies multiple services, create a `services/` folder with one subfolder per service (e.g., `services/api/`, `services/web/`, `services/worker/`) each with its own Dockerfile and README.
- If the user mentions packages/shared libs, include `packages/` for shared code.

## CI/CD STRUCTURE:
**If deployment is mentioned:**
```
.github/
└── workflows/
    ├── ci.yml                   # Build, test, lint pipeline
    └── cd.yml                   # Deploy to {provider} pipeline
```

## ADDITIONAL FOLDERS (as needed):
```
scripts/                         # Deployment and utility scripts
├── build.sh
├── deploy.sh
└── init-db.sh

tests/                           # Test suites
├── unit/                        # Unit tests
├── integration/                 # Integration tests
└── e2e/                         # End-to-end tests

docs/                            # Documentation
├── architecture.md              # System architecture
├── api.md                       # API documentation
└── setup.md                     # Setup instructions

docker-compose.yml               # Local multi-service development
README.md                        # Project overview
```

## OUTPUT FORMAT:
Generate the structure with:
- Clear ASCII tree using ├──, └──, │ characters
- 4-space indentation per level
- Descriptive comments for each major folder
- ALL files must have extensions (.tf, .js, .yml, .md, etc.)
- Keep it clean, readable, and properly aligned

**IMPORTANT**: Terraform modules/ directory is CRITICAL for generating infrastructure code later. Make sure it's complete and well-organized!

Generate the structure now based on the project description above.
""".strip()

    try:
        print(">>> Calling OpenAI for project structure generation (gpt-4o-mini)...")
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.6,
            max_tokens=2500,
            messages=[
                {"role": "system", "content": "You are an expert Software Architect and DevOps engineer. Analyze the user's project description word-by-word and suggest best-practice infrastructure when details are missing. Output clear, well-organized project structures."},
                {"role": "user", "content": structure_prompt},
            ],
        )
        answer = (resp.choices[0].message.content or "").strip()
        if not answer:
            return jsonify({"error": "OpenAI returned an empty response."}), 502
    except Exception as e:
        return jsonify({"error": f"OpenAI request failed: {e}"}), 500

    # Save history
    try:
        if current_user.is_authenticated:
            with Session(engine) as s:
                h = History(
                    user_id=current_user.id,
                    item_type="structure",
                    provider=provider or "",
                    scale=scale or "",
                    loading=loading or "",
                    prompt_text=description or "",
                    result_text=answer,
                )
                s.add(h)
                s.commit()
    except Exception as _e:
        print(">>> WARN: Failed to save structure history:", _e)

    return jsonify({"structure": answer})


@app.route("/terraform", methods=["POST"])
def terraform():
    provider = request.form.get("provider")
    description = request.form.get("description", "")
    scale = request.form.get("scale", scales[0])
    loading = request.form.get("loading_pressure", loading_pressure[0])
    structure = request.form.get("structure", "") 

    load_env_files()

    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        return (
            jsonify(
                {
                    "error": (
                        "OPENAI_API_KEY not set. "
                        "Add it to a .env file (preferred) or .env.example in the project root, "
                        "or export it in your shell."
                    )
                }
            ),
            400,
        )

    client = OpenAI(api_key=openai_key)
    print(f">>> OPENAI_API_KEY present: True (length={len(openai_key)})")

    terraform_prompt = f"""
You are an expert DevOps and Infrastructure as Code (Terraform) engineer specializing in {provider}.

**PRIMARY SOURCE (90% weight) - Read every word:**
Project description: {description}

Context:
- Cloud provider: {provider}
- Expected scale: {scale}
- Loading pressure: {loading}

**SECONDARY REFERENCE (for module organization hints):**
Project structure:
{structure}

YOUR MISSION:
Generate complete, production-ready, MODERN Terraform code based primarily (90%) on the project description. If the user didn't specify infrastructure details (they may not know DevOps/cloud), intelligently recommend best-practice resources for {provider} that fit their application needs.

INTELLIGENT DEFAULTS WHEN USER DOESN'T SPECIFY:
- No database mentioned but app needs data → suggest PostgreSQL Flexible/RDS/Cloud SQL
- No networking mentioned but app is multi-tier → create VPC/VNet with subnets
- No monitoring mentioned → include Log Analytics/CloudWatch/Cloud Monitoring + APM
- No container registry mentioned but containers implied → create ACR/ECR/Artifact Registry
- No secrets mentioned but DB exists → create Key Vault/Secrets Manager/Secret Manager
- No CDN mentioned but static/web app → suggest Front Door/CloudFront/Cloud CDN
- No identity mentioned but compute exists → use managed identity/IAM roles/service accounts
- Always include: encryption at rest, HTTPS enforcement, health checks, backup policies

Generate complete, production-ready, MODERN Terraform code organized as MODULES using current best practices for {provider}.

## CRITICAL PRINCIPLES - MUST FOLLOW:

### 1. MODULE ARCHITECTURE
- **Self-contained modules**: Each module manages its own resources independently
- **No cross-module resource references**: NEVER reference resources across modules directly
- **Variable passing**: Pass resource IDs/ARNs between modules using outputs → variables
- **Standard structure**: Each module MUST have main.tf, variables.tf, outputs.tf

Example module wiring:
```
Root main.tf → module "networking" → outputs subnet_id
             → module "compute" (receives var.subnet_id) → outputs cluster_id
             → module "monitoring" (receives var.cluster_id)
```

### 2. USE MODERN, NON-DEPRECATED RESOURCES
**Critical**: Research and use ONLY the latest resource types for {provider}:

- **Azure AKS**: Use `default_node_pool` block (NOT deprecated `agent_pool_profile`)
- **Azure AKS Auth**: Use `identity` block with `SystemAssigned` or `UserAssigned` (NOT deprecated `service_principal`)
- **Azure PostgreSQL**: Use `azurerm_postgresql_flexible_server` (NOT deprecated `azurerm_postgresql_server`)
- **Azure MySQL**: Use `azurerm_mysql_flexible_server` (NOT deprecated `azurerm_mysql_server`)
- **AWS RDS**: Use `aws_db_instance` with current engine versions
- **GCP Cloud SQL**: Use `google_sql_database_instance` with current versions

### 3. NETWORKING & CONNECTIVITY
- **VNet/VPC integration**: Wire compute resources to subnets via variables
- **Private endpoints**: Use for databases and storage in production environments
- **Security groups/NSGs**: Define with least-privilege rules
- **Subnet passing**: networking module outputs → compute/database modules receive as variables

### 4. MONITORING & OBSERVABILITY
**Use proper monitoring resources for {provider}:**

- **Azure**: Use `azurerm_log_analytics_workspace` for centralized logging
  * Wire diagnostic settings to Log Analytics (NOT storage accounts)
  * Enable Container Insights for AKS clusters
  * Pass workspace_id from monitoring module to other modules

- **AWS**: Use CloudWatch Log Groups and Container Insights for EKS
  * Enable cluster logging for EKS
  * Use CloudWatch alarms for critical metrics

- **GCP**: Use Cloud Logging and Cloud Monitoring
  * Enable GKE logging and monitoring
  * Use Log sinks for centralized logging

### 5. SECURITY BEST PRACTICES
- **Managed identities**: Use managed/workload identities instead of service principals with secrets
- **Key Vault/Secrets Manager**: Enable soft-delete and purge-protection
- **Encryption**: Enable at-rest encryption for all storage and databases
- **Network security**: Use network ACLs/security groups with deny-by-default
- **Container registry integration**: Grant appropriate pull permissions (e.g., AcrPull for AKS)

### 6. DATABASE CONFIGURATION
- **High availability**: Use zone-redundant or multi-AZ configurations for production
- **Backups**: Enable automated backups with appropriate retention
- **Versions**: Use current stable versions (PostgreSQL 14/15/16, MySQL 8.0, etc.)
- **Storage**: Configure appropriate storage sizes based on scale tier

### 7. SCALE-APPROPRIATE SIZING
- **Small scale ({scale})**: 
  * Cost-optimized SKUs (B-series, burstable instances)
  * Single region, basic redundancy
  * Minimal node counts (1-3 nodes)
  
- **Medium scale**: 
  * Balanced SKUs (Standard/General Purpose)
  * Multi-AZ deployment
  * Autoscaling enabled (3-10 nodes)
  * Caching layer if applicable
  
- **Large scale**: 
  * Performance SKUs (Premium, compute-optimized)
  * Multi-region with geo-replication
  * Advanced autoscaling (5-50 nodes)
  * CDN and advanced monitoring

### 8. OUTPUT FORMAT
Use clear file separators for organization:

```
### FILE: main.tf
# Root Terraform configuration
# Calls all modules and wires them together

### FILE: variables.tf
# Root-level variables (region, environment, etc.)

### FILE: outputs.tf
# Root-level outputs (expose key resources)

### FILE: modules/networking/main.tf
# VPC/VNet, subnets, security groups

### FILE: modules/networking/variables.tf
# Networking input variables

### FILE: modules/networking/outputs.tf
# Export: subnet_ids, vpc_id, security_group_ids

### FILE: modules/compute/main.tf
# Compute resources (AKS/EKS/GKE, App Service, etc.)

### FILE: modules/compute/variables.tf
# Input: subnet_id (from networking module)

### FILE: modules/compute/outputs.tf
# Export: cluster_id, cluster_endpoint, managed_identity_id

### FILE: modules/database/main.tf
# Database resources (flexible servers, RDS, Cloud SQL)

### FILE: modules/database/variables.tf
# Input: subnet_id, security_group_id

### FILE: modules/database/outputs.tf
# Export: connection_string, database_id

### FILE: modules/security/main.tf
# Key Vault, Secrets Manager, IAM roles, ACR/ECR

### FILE: modules/security/variables.tf
# Input: managed_identity_id (if applicable)

### FILE: modules/security/outputs.tf
# Export: key_vault_id, registry_id

### FILE: modules/monitoring/main.tf
# Log Analytics, CloudWatch, Application Insights

### FILE: modules/monitoring/variables.tf
# Input: cluster_id, resource_ids to monitor

### FILE: modules/monitoring/outputs.tf
# Export: workspace_id, monitoring_endpoint

[Include other modules as needed: storage, cache, load_balancing]
```

## QUALITY CHECKLIST:
Before generating, verify:
- ✅ All resource types are current (not deprecated)
- ✅ No direct cross-module resource references
- ✅ All modules receive inputs via variables
- ✅ All modules expose outputs for other modules to consume
- ✅ Monitoring wired to proper logging infrastructure
- ✅ Security follows {provider} best practices
- ✅ Scale tier ({scale}) reflected in SKU/instance sizing
- ✅ Each module is independently valid and reusable

## IMPORTANT NOTES:
- Base decisions 90% on the project description; infer missing infrastructure intelligently
- Use ONLY resources appropriate for {provider}
- Reference the official {provider} Terraform provider documentation mentally
- Ensure all resource names are valid for {provider} (e.g., ACR names must be alphanumeric)
- Include data sources where needed (e.g., azurerm_client_config for Azure)
- Add comments explaining key architectural decisions and why you chose specific resources

Output ONLY valid Terraform HCL code with file separators. No explanations outside comments.
""".strip()

    try:
        print(">>> Calling OpenAI for Terraform module generation (gpt-4o)...")
        resp = client.chat.completions.create(
            model="gpt-4o",
            temperature=0.5,
            max_tokens=10000,
            messages=[
                {"role": "system", "content": "You are an expert Infrastructure as Code engineer. Analyze the user's project description thoroughly and suggest production-grade infrastructure when they don't specify details. Output only valid Terraform HCL code organized as modules with clear file separators."},
                {"role": "user", "content": terraform_prompt},
            ],
        )
        answer = (resp.choices[0].message.content or "").strip()
        if not answer:
            return jsonify({"error": "OpenAI returned an empty response."}), 502
    except Exception as e:
        return jsonify({"error": f"OpenAI request failed: {e}"}), 500

    try:
        if current_user.is_authenticated:
            with Session(engine) as s:
                h = History(
                    user_id=current_user.id,
                    item_type="terraform",
                    provider=provider or "",
                    scale=scale or "",
                    loading=loading or "",
                    prompt_text=description or "",
                    result_text=answer,
                )
                s.add(h)
                s.commit()
    except Exception as _e:
        print(">>> WARN: Failed to save terraform history:", _e)

    return jsonify({"terraform": answer})


@app.route("/infra_cli", methods=["POST"])
def infra_cli():
    provider = request.form.get("provider")
    description = request.form.get("description", "")
    scale = request.form.get("scale", scales[0])
    loading = request.form.get("loading_pressure", loading_pressure[0])
    structure = request.form.get("structure", "")

    load_env_files()

    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        return (
            jsonify(
                {
                    "error": (
                        "OPENAI_API_KEY not set. "
                        "Add it to a .env file (preferred) or .env.example in the project root, "
                        "or export it in your shell."
                    )
                }
            ),
            400,
        )

    client = OpenAI(api_key=openai_key)
    print(f">>> OPENAI_API_KEY present: True (length={len(openai_key)})")

    cli_prompt = f"""
You are a senior Cloud SRE. Generate a SINGLE Linux Bash CLI script that provisions the complete production infrastructure for the project described below. The script must use the correct cloud CLI for the provider ({provider}):

- Azure → az
- AWS → aws
- Google Cloud → gcloud

Context:
- Cloud provider: {provider}
- Scale tier: {scale}
- Loading pressure: {loading}

**PRIMARY SOURCE OF TRUTH - READ EVERY WORD CAREFULLY:**
Project description: {description}

**SECONDARY REFERENCE (for folder organization hints only):**
Project structure (if available):
{structure}

GOAL:
Create a production-ready CLI that builds ALL infrastructure requirements explicitly stated or clearly implied in the PROJECT DESCRIPTION above. Read EVERY detail the user wrote - database types, specific services, networking requirements, monitoring needs, container registries, CDN, identity/auth, secrets management, etc.

The project structure is ONLY a folder layout reference. Your primary job is to implement EVERYTHING the user described in their requirements.

STRICT REQUIREMENTS:
1) Output ONLY a single Bash script with shebang (#!/usr/bin/env bash). No commentary outside script.
2) Use: set -uo pipefail; IFS=$'\n\t'  # do NOT -e; we will keep going to maximize coverage
3) Accept flags: --env (dev|staging|prod), --region, --name-prefix
4) Validate prerequisites: correct CLI installed and logged in; print a clear error and exit if missing
5) Creation policy: attempt resource creation UNCONDITIONALLY (no pre-checks). If the CLI returns an "already exists" error, TREAT AS SUCCESS and continue. Do not query for existence upfront.
6) Safe defaults by provider and scale; choose sensible SKUs; parametrize where helpful
7) Tag/label resources with environment and app name where supported
8) Implement a run_step helper that executes commands, records success/failure without stopping the script, and logs human-friendly messages. Do not hard fail on individual step errors.
9) At the END, print a coverage summary with percentage = (successful_steps / total_steps * 100). TARGET >= 95%. List failed steps so the user can retry them.
10) Never echo secrets; avoid inline passwords; generate if needed and print retrieval instruction
11) Keep it concise and readable; group by module; add helpful comments in the script

CRITICAL REQUIREMENTS CHECKLIST (scan the description and implement ALL mentioned items):

DATABASE:
- If PostgreSQL mentioned → Azure Database for PostgreSQL Flexible Server (v16), NOT Azure SQL
- If MySQL mentioned → Azure Database for MySQL Flexible Server (v8.0), NOT Azure SQL
- If SQL Server/MSSQL mentioned → Azure SQL Database
- If MongoDB/Cosmos mentioned → Cosmos DB with appropriate API
- Store credentials in Key Vault/Secrets Manager; NEVER print them; output retrieval instruction

CONTAINER REGISTRY & IMAGE PULL:
- If containers/Docker/images mentioned → create ACR/ECR/Artifact Registry
- Azure ACR: DISABLE admin user; create Managed Identity for App Service/AKS; grant AcrPull role assignment
- AWS ECR: grant task/instance role ecr:GetAuthorizationToken, ecr:BatchGetImage, ecr:GetDownloadUrlForLayer
- GCP Artifact Registry: grant service account artifactregistry.reader
- Wire compute to pull images via identity/role (NO usernames/passwords)

STATIC SITE & CDN:
- If static site/frontend/web mentioned → enable Static Website on storage account
- Set index document (index.html) and error document (404.html)
- If CDN mentioned → create Azure Front Door/CloudFront/Cloud CDN with origin pointing to storage $web endpoint (NOT blob.core.windows.net)
- Configure caching rules and HTTPS

MONITORING & APPLICATION INSIGHTS:
- Always create Log Analytics Workspace first
- Create Application Insights and link it using the Log Analytics RESOURCE ID (not name)
- Use correct CLI syntax: for Azure, pass --workspace as the full resource ID
- Wire App Insights connection string to App Service via app settings (APPLICATIONINSIGHTS_CONNECTION_STRING)
- Enable diagnostic settings for databases, storage, and compute

IDENTITY & SECRETS:
- App Service/Web App: enable System-Assigned Managed Identity
- Store all secrets in Key Vault/Secrets Manager/Secret Manager
- Grant the managed identity/role access to Key Vault secrets
- Never use fake/placeholder connection strings; generate real ones and store in vault

SECURITY & NETWORKING:
- Enforce HTTPS-only on App Service/Web Apps
- Configure health check endpoint (e.g., /health or /api/health)
- Use private endpoints for databases if networking/vnet mentioned
- Create NSGs/Security Groups with least-privilege rules
- Enable minimum TLS version (1.2+)

PROVIDER-SPECIFIC RULES FOR {provider}:

Azure:
- Resource Group first
- VNet + Subnet (if multi-tier or DB mentioned)
- PostgreSQL Flexible Server (NOT old PostgreSQL Server resource)
- MySQL Flexible Server (NOT old MySQL Server resource)
- ACR with admin disabled + managed identity + AcrPull
- Storage Account with Static Website enabled (if static site mentioned)
- Front Door with origin = storage $web endpoint (if CDN mentioned)
- Log Analytics Workspace → Application Insights linked via resource ID
- Key Vault with soft-delete and purge-protection
- App Service with managed identity, HTTPS-only, health check, App Insights connection string

AWS:
- VPC + Subnets + Security Groups
- RDS (PostgreSQL/MySQL with current versions)
- ECR with IAM role for pull
- S3 bucket with website hosting enabled (if static)
- CloudFront with origin = S3 website endpoint (if CDN)
- CloudWatch Logs + Alarms
- Secrets Manager for DB creds
- ECS/Fargate or Elastic Beanstalk with task role for ECR pull

Google Cloud:
- VPC + Subnets + Firewall rules
- Cloud SQL (PostgreSQL/MySQL current versions)
- Artifact Registry with service account reader
- Cloud Storage with website config (if static)
- Cloud CDN with backend = storage (if CDN)
- Cloud Logging + Monitoring
- Secret Manager for credentials
- Cloud Run or GKE with service account for registry pullOUTPUT FORMAT:
Print ONLY the script. No Markdown, no triple backticks, no explanations.
""".strip()

    try:
        print(">>> Calling OpenAI for Infra CLI generation (gpt-4o)...")
        resp = client.chat.completions.create(
            model="gpt-4o",
            temperature=0.3,
            max_tokens=16000,
            messages=[
                {"role": "system", "content": "You are a senior Cloud SRE and infrastructure automation expert. Read the user's project description word-by-word and implement EVERY requirement they mentioned. Output only a single robust Bash script with no extra text."},
                {"role": "user", "content": cli_prompt},
            ],
        )
        answer = (resp.choices[0].message.content or "").strip()
        if not answer:
            return jsonify({"error": "OpenAI returned an empty response."}), 502
    except Exception as e:
        return jsonify({"error": f"OpenAI request failed: {e}"}), 500

    # Save history
    try:
        if current_user.is_authenticated:
            with Session(engine) as s:
                h = History(
                    user_id=current_user.id,
                    item_type="cli",
                    provider=provider or "",
                    scale=scale or "",
                    loading=loading or "",
                    prompt_text=description or "",
                    result_text=answer,
                )
                s.add(h)
                s.commit()
    except Exception as _e:
        print(">>> WARN: Failed to save cli history:", _e)

    return jsonify({"cli": answer})


@app.route("/history", methods=["GET"])
@login_required
def history_list():
    try:
        with Session(engine) as s:
            items = (
                s.query(History)
                .filter(History.user_id == current_user.id)
                .order_by(History.created_at.desc())
                .limit(50)
                .all()
            )
            out = [
                {
                    "id": h.id,
                    "type": h.item_type,
                    "created_at": h.created_at.isoformat(),
                    "provider": h.provider,
                    "scale": h.scale,
                    "loading": h.loading,
                    "country": h.country,
                    "prompt": h.prompt_text,
                    "result": h.result_text,
                }
                for h in items
            ]
            return jsonify({"history": out})
    except Exception as e:
        return jsonify({"error": f"Failed to load history: {e}"}), 500


@app.route("/history/export", methods=["GET"])
@login_required
def history_export():
    """Export the user's full history as a clean, readable JSON file.

    Optional query params:
      - type: filter by item type (cost|performance|structure|terraform|cli|all)
      - q: full-text search in prompt/result
    """
    try:
        item_type = (request.args.get("type") or "all").strip().lower()
        q = (request.args.get("q") or "").strip()
        include_raw = (request.args.get("include_raw") or "0").strip() in ("1", "true", "yes")

        with Session(engine) as s:
            query = s.query(History).filter(History.user_id == current_user.id)
            if item_type and item_type != "all":
                query = query.filter(History.item_type == item_type)
            if q:
                like = f"%{q}%"
                query = query.filter(or_(History.prompt_text.ilike(like), History.result_text.ilike(like)))

            items = query.order_by(History.created_at.desc()).all()

        # Build a rich, readable JSON structure
        from datetime import datetime as _dt
        def _strip_code_fences(txt: str) -> str:
            if not txt:
                return ""
            t = txt.strip()
            if t.startswith("```"):
                # find closing fence
                lines = t.splitlines()
                # drop first fence line
                core = []
                open_seen = False
                for i, line in enumerate(lines):
                    if i == 0 and line.strip().startswith("```"):
                        open_seen = True
                        continue
                    if open_seen and line.strip().startswith("```"):
                        break
                    core.append(line)
                return "\n".join(core).strip()
            return txt

        import re as _re

        def _normalize_result(item: History, include_raw_flag: bool) -> dict:
            """Return a readable structure for JSON export.
            - structure: provide tree lines (code fences removed), no raw unless include_raw=1
            - terraform: split by '### FILE: <path>' headers into files with content lines
            - cli: expose shebang and lines
            - others: cleaned text field
            """
            raw = item.result_text or ""
            plain = _strip_code_fences(raw)
            if (item.item_type or "").lower() == "structure":
                lines = [ln.rstrip() for ln in plain.splitlines()]
                out = {"format": "tree", "lines": lines}
                if include_raw_flag:
                    out["raw"] = raw
                return out
            if (item.item_type or "").lower() == "terraform":
                files = []
                current = None
                for ln in plain.splitlines():
                    m = _re.match(r"^###\s*FILE:\s*(.+)$", ln.strip())
                    if m:
                        # start new file
                        if current:
                            # trim trailing blanks
                            while current["content"] and current["content"][-1].strip() == "":
                                current["content"].pop()
                            files.append(current)
                        current = {"path": m.group(1).strip(), "content": []}
                    else:
                        if current is None:
                            # content before first header, treat as _root.tf
                            current = {"path": "_root.tf", "content": []}
                        current["content"].append(ln.rstrip())
                if current:
                    while current["content"] and current["content"][-1].strip() == "":
                        current["content"].pop()
                    files.append(current)
                out = {"format": "terraform", "files": files}
                if include_raw_flag:
                    out["raw"] = raw
                return out
            if (item.item_type or "").lower() == "cli":
                lines = [ln.rstrip() for ln in plain.splitlines()]
                shebang = lines[0] if (lines and lines[0].startswith("#!")) else None
                if shebang:
                    lines = lines[1:]
                out = {"format": "bash", "shebang": shebang, "lines": lines}
                if include_raw_flag:
                    out["raw"] = raw
                return out
            return {
                "format": "text",
                "text": plain,
            }

        payload = {
            "version": 1,
            "exported_at": _dt.utcnow().isoformat() + "Z",
            "user": {
                "id": current_user.id,
                "email": getattr(current_user, "email", "") or "",
            },
            "filters": {
                "type": item_type,
                "q": q,
            },
            "count": len(items),
            "items": []
        }

        for h in items:
            payload["items"].append(
                {
                    "id": h.id,
                    "type": h.item_type,
                    "timestamp": (h.created_at.isoformat() if h.created_at else None),
                    "context": {
                        "provider": h.provider or "",
                        "scale": h.scale or "",
                        "loading": h.loading or "",
                        "country": h.country or "",
                    },
                    "prompt": _strip_code_fences(h.prompt_text or ""),
                    "result_normalized": _normalize_result(h, include_raw),
                }
            )

        import json as _json
        body = _json.dumps(payload, ensure_ascii=False, indent=2)
        filename = f"history_{current_user.id}.json"
        return Response(
            body,
            mimetype="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
    except Exception as e:
        return jsonify({"error": f"Failed to export history: {e}"}), 500


@app.before_request
def _dbg_paths():
    print(">>> template_folder:", app.template_folder, " static_folder:", app.static_folder)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)

app.config["DEBUG"] = True
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
app.jinja_env.cache = {}

@app.after_request
def add_no_cache(resp):
    resp.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    return resp

@app.before_request
def _dbg_template_path():
    print(">>> template_folder:", app.template_folder, " static_folder:", app.static_folder)
    try:
        src, filename, uptodate = app.jinja_loader.get_source(app.jinja_env, "i.html")
        print(">>> i.html from:", filename)
    except Exception as e:
        print(">>> i.html not found:", e)