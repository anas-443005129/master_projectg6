# HTML Templates

This folder contains the Flask HTML templates used to render the web UI.

Usage

- Flask automatically loads templates from this folder when rendering views. Example in `Flask_App.py`:

```py
from flask import render_template
return render_template('index.html')
```

Customize the templates and use Jinja2 templating features for dynamic content.
