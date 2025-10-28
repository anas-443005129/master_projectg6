$(document).ready(function() {
    $('#generate-terraform-btn').hide();
    $('#generate-cli-btn').hide();
    
    $('#container-solutions-container').hide();
    $('#solutions-form').hide();
    
    // Toast Notification System
    let toastIdCounter = 0;
    
    function showToast(type, title, message, duration = 5000) {
        const toastId = `toast-${toastIdCounter++}`;
        const icons = {
            loading: '⏳',
            success: '✅',
            error: '❌'
        };
        
        const toastHTML = `
            <div class="toast ${type}" id="${toastId}">
                <div class="toast-icon">${icons[type]}</div>
                <div class="toast-content">
                    <div class="toast-title">${title}</div>
                    <div class="toast-message">${message}</div>
                </div>
            </div>
        `;
        
        $('#toast-container').append(toastHTML);
        
        // Auto-remove after duration (except for loading toasts)
        if (type !== 'loading' && duration > 0) {
            setTimeout(() => {
                hideToast(toastId);
            }, duration);
        }
        
        return toastId;
    }
    
    function hideToast(toastId) {
        const $toast = $(`#${toastId}`);
        if ($toast.length) {
            $toast.addClass('hiding');
            setTimeout(() => {
                $toast.remove();
            }, 300);
        }
    }
    
    function updateToast(toastId, type, title, message) {
        const $toast = $(`#${toastId}`);
        if ($toast.length) {
            const icons = {
                loading: '⏳',
                success: '✅',
                error: '❌'
            };
            
            $toast.attr('class', `toast ${type}`);
            $toast.find('.toast-icon').text(icons[type]);
            $toast.find('.toast-title').text(title);
            $toast.find('.toast-message').text(message);
            
            // Auto-hide success/error toasts
            if (type !== 'loading') {
                setTimeout(() => {
                    hideToast(toastId);
                }, 5000);
            }
        }
    }
   
    const MAX_DESC_HEIGHT = 420; // keep in sync with CSS max-height
    function adjustDescriptionHeight(el) {
        const ta = el || document.getElementById('description');
        if (!ta) return;
        ta.style.height = 'auto';
        const desired = Math.min(ta.scrollHeight, MAX_DESC_HEIGHT);
        ta.style.height = desired + 'px';
        if (ta.scrollHeight > MAX_DESC_HEIGHT) {
            ta.style.overflowY = 'auto';
        } else {
            ta.style.overflowY = 'hidden';
        }
    }
    const textarea = document.getElementById('description');
    if (textarea) {
        textarea.addEventListener('input', function() {
            adjustDescriptionHeight(this);
        });
        // Initial adjust on load
        adjustDescriptionHeight(textarea);
    }
    function setActive($group, $btn) {
        const $buttons = $group.find('.btn');
        $buttons.removeClass('active');
        $buttons.attr('aria-pressed', 'false');
        $btn.addClass('active');
        $btn.attr('aria-pressed', 'true');
    }
    const firstProviderBtn = $('#provider-group .provider-btn').first();
    if (firstProviderBtn.length) {
        setActive($('#provider-group'), firstProviderBtn);
        $('#provider').val(firstProviderBtn.data('value'));
    }
    const firstScaleBtn = $('#scale-group .scale-btn').first();
    if (firstScaleBtn.length) {
        setActive($('#scale-group'), firstScaleBtn);
        $('#scale').val(firstScaleBtn.data('value'));
    }

    const firstLoadingBtn = $('#loading-group .loading-btn').first();
    if (firstLoadingBtn.length) {
        setActive($('#loading-group'), firstLoadingBtn);
        $('#loading_pressure').val(firstLoadingBtn.data('value'));
    }
    $('#provider-group').on('click', '.provider-btn', function() {
        setActive($('#provider-group'), $(this));
        $('#provider').val($(this).data('value'));
    });

    $('#scale-group').on('click', '.scale-btn', function() {
        setActive($('#scale-group'), $(this));
        $('#scale').val($(this).data('value'));
    });
    $('#loading-group').on('click', '.loading-btn', function() {
        setActive($('#loading-group'), $(this));
        $('#loading_pressure').val($(this).data('value'));
    });

    // Persist and restore form inputs for better UX
    try {
        const savedProvider = localStorage.getItem('form_provider');
        const savedScale = localStorage.getItem('form_scale');
        const savedLoading = localStorage.getItem('form_loading');
        const savedCountry = localStorage.getItem('form_country');
        const savedDesc = localStorage.getItem('form_description');
        if (savedCountry) $('#country').val(savedCountry);
        if (savedDesc) {
            $('#description').val(savedDesc);
            // Recalculate height after restoring saved text
            adjustDescriptionHeight(document.getElementById('description'));
        }
        if (savedProvider) {
            $('#provider').val(savedProvider);
            const btn = $(`#provider-group .provider-btn[data-value='${savedProvider}']`);
            if (btn.length) setActive($('#provider-group'), btn);
        }
        if (savedScale) {
            $('#scale').val(savedScale);
            const btn = $(`#scale-group .scale-btn[data-value="${savedScale}"]`);
            if (btn.length) setActive($('#scale-group'), btn);
        }
        if (savedLoading) {
            $('#loading_pressure').val(savedLoading);
            const btn = $(`#loading-group .loading-btn[data-value='${savedLoading}']`);
            if (btn.length) setActive($('#loading-group'), btn);
        }
    } catch (e) {}

    $('#country').on('input', function(){ localStorage.setItem('form_country', $(this).val()); });
    $('#description').on('input', function(){
        localStorage.setItem('form_description', $(this).val());
        adjustDescriptionHeight(this);
    });

    // Character counter for description
    (function(){
        const $desc = $('#description');
        const $count = $('#desc-count');
        if ($desc.length && $count.length) {
            const max = Number($desc.attr('maxlength')) || 0;
            const update = () => {
                const val = $desc.val() || '';
                $count.text(`${val.length} / ${max || val.length}`);
            };
            $desc.on('input', update);
            update();
        }
    })();

    // Country searchable combobox (lightweight, no libs)
    (function(){
        const COUNTRIES = [
            'Saudi Arabia','United Arab Emirates','Egypt','United States','Germany','United Kingdom','France','India','Japan','Singapore','Canada','Australia','Brazil','Mexico','Spain','Italy','Netherlands','Sweden','Norway','Denmark','Finland','Poland','Czech Republic','Austria','Switzerland','Belgium','Portugal','Ireland','Greece','Turkey','South Africa','Nigeria','Kenya','Morocco','Algeria','Tunisia','Qatar','Kuwait','Bahrain','Oman','Jordan','Lebanon','Israel','Pakistan','Bangladesh','Sri Lanka','Nepal','Philippines','Indonesia','Malaysia','Thailand','Vietnam','South Korea','China','Taiwan','Hong Kong','New Zealand','Russia','Ukraine','Argentina','Chile','Colombia','Peru','Romania','Hungary','Bulgaria','Slovakia','Slovenia','Estonia','Lithuania','Latvia','Iceland','Luxembourg','Singapore'
        ];

        const $combo = $('#country-combo');
        const $input = $('#country');
        const $list = $('#country-list');

        function renderList(filter) {
            const q = (filter || '').toLowerCase();
            const items = COUNTRIES.filter(c => !q || c.toLowerCase().includes(q)).slice(0, 200);
            const html = items.map((c,i)=>`<li class="combo-item" role="option" tabindex="-1" data-value="${c}">${c}</li>`).join('');
            $list.html(html);
            // select first by default for keyboard nav
            $list.find('.combo-item').first().attr('aria-selected','true');
        }
        function openList(showAll=false){
            if (showAll) { $input.trigger('input'); }
            renderList($input.val());
            $combo.addClass('open');
            $input.attr('aria-expanded','true');
        }
        function closeList(){
            $combo.removeClass('open');
            $input.attr('aria-expanded','false');
        }
        // Init
        renderList('');

        // Open on focus or toggle click
        $input.on('focus', function(){ openList(true); });
        $combo.find('.combo-toggle').on('click', function(){
            if ($combo.hasClass('open')) closeList(); else openList(true);
        });
        $input.on('input', function(){ renderList($input.val()); openList(); localStorage.setItem('form_country', $(this).val()); });
        $list.on('click','.combo-item', function(){
            const val = $(this).data('value');
            $input.val(val);
            localStorage.setItem('form_country', val);
            closeList();
        });
        $input.on('keydown', function(e){
            const $items = $list.find('.combo-item');
            let $current = $items.filter('[aria-selected="true"]').first();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                openList();
                const $next = ($current.length ? $current.next() : $items.first());
                $items.attr('aria-selected','false');
                $next.attr('aria-selected','true');
                $next[0]?.scrollIntoView({block:'nearest'});
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                openList();
                const $prev = ($current.length ? $current.prev() : $items.last());
                $items.attr('aria-selected','false');
                $prev.attr('aria-selected','true');
                $prev[0]?.scrollIntoView({block:'nearest'});
            } else if (e.key === 'Enter') {
                if ($combo.hasClass('open')) {
                    e.preventDefault();
                    const val = ($current.text() || $input.val());
                    $input.val(val);
                    localStorage.setItem('form_country', val);
                    closeList();
                }
            } else if (e.key === 'Escape') {
                closeList();
            }
        });
        $(document).on('click', function(e){
            if (!$.contains($combo[0], e.target)) closeList();
        });
    })();

    function setBusy(isBusy) {
        const $buttons = $('#generate-cost-btn, #generate-performance-btn, #generate-structure-btn, #generate-terraform-btn, #generate-cli-btn');
        $buttons.prop('disabled', !!isBusy);
    }

    $('#generate-cost-btn').on('click', function(event) {
        event.preventDefault();
        setBusy(true);
        const toastId = showToast('loading', 'Generating Cost Best Practices', 'Please wait while AI analyzes your cost optimization requirements...', 0);
        
        const data = {
            provider: $('#provider').val(),
            scale: $('#scale').val(),
            loading_pressure: $('#loading_pressure').val(),
            country: $('#country').val(),
            description: $('#description').val()
        };
        $.ajax({
            url: '/best_practices_cost',
            method: 'POST',
            data: data,
            success: function(response) {
                if (response.cost) {
                    updateToast(toastId, 'success', 'Cost Best Practices Generated!', 'Your cost optimization recommendations with SAR pricing are ready.');
                    showCost(response.cost);
                } else if (response.error) {
                    updateToast(toastId, 'error', 'Generation Failed', response.error);
                    showCost('Error: ' + response.error);
                } else {
                    updateToast(toastId, 'error', 'No Response', 'Server returned empty response.');
                    showCost('No response from server.');
                }
                setBusy(false);
            },
            error: function(xhr) {
                updateToast(toastId, 'error', 'Request Failed', xhr.responseText || 'Network error occurred.');
                showCost('Request failed: ' + xhr.responseText);
                setBusy(false);
            }
        });
    });

    function showCost(text) {
        const card = $('#cost-card');
        const box = $('#cost-text');
        box.text(text || 'No cost recommendations returned.');
        card.removeClass('hidden');
        const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text || '');
        $('#download-cost').attr('href', href);
        localStorage.setItem('devops_cost', text || '');
        updateGridLayout();
        checkAndShowClearButton();
        $('html, body').animate({ scrollTop: card.offset().top - 60 }, 400);
    }

    $('#copy-cost').on('click', function() {
        const txt = $('#cost-text').text() || '';
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
    });

    $('#generate-performance-btn').on('click', function(event) {
        event.preventDefault();
        setBusy(true);
        const toastId = showToast('loading', 'Generating Performance Best Practices', 'Please wait while AI analyzes your performance optimization requirements...', 0);
        
        const data = {
            provider: $('#provider').val(),
            scale: $('#scale').val(),
            loading_pressure: $('#loading_pressure').val(),
            country: $('#country').val(),
            description: $('#description').val()
        };
        $.ajax({
            url: '/best_practices_performance',
            method: 'POST',
            data: data,
            success: function(response) {
                if (response.performance) {
                    updateToast(toastId, 'success', 'Performance Best Practices Generated!', 'Your performance optimization recommendations are ready.');
                    showPerformance(response.performance);
                } else if (response.error) {
                    updateToast(toastId, 'error', 'Generation Failed', response.error);
                    showPerformance('Error: ' + response.error);
                } else {
                    updateToast(toastId, 'error', 'No Response', 'Server returned empty response.');
                    showPerformance('No response from server.');
                }
                setBusy(false);
            },
            error: function(xhr) {
                updateToast(toastId, 'error', 'Request Failed', xhr.responseText || 'Network error occurred.');
                showPerformance('Request failed: ' + xhr.responseText);
                setBusy(false);
            }
        });
    });

    function showPerformance(text) {
        const card = $('#performance-card');
        const box = $('#performance-text');
        box.text(text || 'No performance recommendations returned.');
        card.removeClass('hidden');
        const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text || '');
        $('#download-performance').attr('href', href);
        localStorage.setItem('devops_performance', text || '');
        updateGridLayout();
        checkAndShowClearButton();
        $('html, body').animate({ scrollTop: card.offset().top - 60 }, 400);
    }

    $('#copy-performance').on('click', function() {
        const txt = $('#performance-text').text() || '';
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
    });

    $('#generate-form').on('submit', function(event) {
        event.preventDefault();
    });

    $('#generate-structure-btn').on('click', function(event) {
        event.preventDefault();
        setBusy(true);
        const toastId = showToast('loading', 'Generating Project Structure', 'Creating folder structure based on your project...', 0);
        
        const data = {
            provider: $('#provider').val(),
            scale: $('#scale').val(),
            loading_pressure: $('#loading_pressure').val(),
            description: $('#description').val()
        };
        $.ajax({
            url: '/structure',
            method: 'POST',
            data: data,
            success: function(response) {
                if (response.structure) {
                    updateToast(toastId, 'success', 'Structure Generated!', 'Project folder structure is ready.');
                    showStructure(response.structure);
                    $('#generate-terraform-btn').fadeIn();
                    $('#generate-cli-btn').fadeIn();
                } else if (response.error) {
                    updateToast(toastId, 'error', 'Generation Failed', response.error);
                    showStructure('Error: ' + response.error);
                } else {
                    updateToast(toastId, 'error', 'No Response', 'Server returned empty response.');
                    showStructure('No response from server.');
                }
                setBusy(false);
            },
            error: function(xhr) {
                updateToast(toastId, 'error', 'Request Failed', xhr.responseText || 'Network error occurred.');
                showStructure('Request failed: ' + xhr.responseText);
                setBusy(false);
            }
        });
    });

    function showStructure(text) {
        const card = $('#structure-card');
        const box = $('#structure-text');
        box.text(text || 'No structure returned.');
        card.removeClass('hidden');
        const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text || '');
        $('#download-structure').attr('href', href);
        localStorage.setItem('devops_structure', text || '');
        updateGridLayout();
        checkAndShowClearButton();
        $('html, body').animate({ scrollTop: card.offset().top - 60 }, 400);
    }

    $('#copy-structure').on('click', function() {
        const txt = $('#structure-text').text() || '';
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
    });

    $('#generate-terraform-btn').on('click', function(event) {
        event.preventDefault();
        setBusy(true);
        const structure = $('#structure-text').text() || localStorage.getItem('devops_structure') || '';
        
        if (!structure || structure.trim().length === 0) {
            showToast('error', 'Structure Required', 'Please generate Project Structure first!', 4000);
            return;
        }

        const toastId = showToast('loading', 'Generating Terraform Code', 'Creating infrastructure as code modules...', 0);

        const data = {
            provider: $('#provider').val(),
            scale: $('#scale').val(),
            loading_pressure: $('#loading_pressure').val(),
            description: $('#description').val(),
            structure: structure
        };
        $.ajax({
            url: '/terraform',
            method: 'POST',
            data: data,
            success: function(response) {
                if (response.terraform) {
                    updateToast(toastId, 'success', 'Terraform Generated!', 'Infrastructure code is ready to deploy.');
                    showTerraform(response.terraform);
                } else if (response.error) {
                    updateToast(toastId, 'error', 'Generation Failed', response.error);
                    showTerraform('Error: ' + response.error);
                } else {
                    updateToast(toastId, 'error', 'No Response', 'Server returned empty response.');
                    showTerraform('No response from server.');
                }
                setBusy(false);
            },
            error: function(xhr) {
                updateToast(toastId, 'error', 'Request Failed', xhr.responseText || 'Network error occurred.');
                showTerraform('Request failed: ' + xhr.responseText);
                setBusy(false);
            }
        });
    });

    $('#generate-cli-btn').on('click', function(event) {
        event.preventDefault();
        setBusy(true);
        const structure = $('#structure-text').text() || localStorage.getItem('devops_structure') || '';

        if (!structure || structure.trim().length === 0) {
            showToast('error', 'Structure Required', 'Please generate Project Structure first!', 4000);
            return;
        }

        const toastId = showToast('loading', 'Generating Infra CLI', 'Building a Linux CLI script matched to your provider...', 0);

        const data = {
            provider: $('#provider').val(),
            scale: $('#scale').val(),
            loading_pressure: $('#loading_pressure').val(),
            description: $('#description').val(),
            structure: structure
        };
        $.ajax({
            url: '/infra_cli',
            method: 'POST',
            data: data,
            success: function(response) {
                if (response.cli) {
                    updateToast(toastId, 'success', 'Infra CLI Ready!', 'Linux CLI script generated successfully.');
                    showCli(response.cli);
                } else if (response.error) {
                    updateToast(toastId, 'error', 'Generation Failed', response.error);
                    showCli('Error: ' + response.error);
                } else {
                    updateToast(toastId, 'error', 'No Response', 'Server returned empty response.');
                    showCli('No response from server.');
                }
                setBusy(false);
            },
            error: function(xhr) {
                updateToast(toastId, 'error', 'Request Failed', xhr.responseText || 'Network error occurred.');
                showCli('Request failed: ' + xhr.responseText);
                setBusy(false);
            }
        });
    });

    function showCli(text) {
        const card = $('#cli-card');
        const box = $('#cli-text');
        box.text(text || 'No CLI script returned.');
        card.removeClass('hidden');
        const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text || '');
        $('#download-cli').attr('href', href);
        localStorage.setItem('devops_cli', text || '');
        updateGridLayout();
        checkAndShowClearButton();
        $('html, body').animate({ scrollTop: card.offset().top - 60 }, 400);
    }

    function showTerraform(text) {
        const card = $('#terraform-card');
        const box = $('#terraform-text');
        box.text(text || 'No Terraform code returned.');
        card.removeClass('hidden');
        const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text || '');
        $('#download-terraform').attr('href', href);
        localStorage.setItem('devops_terraform', text || '');
        updateGridLayout();
        checkAndShowClearButton();
        $('html, body').animate({ scrollTop: card.offset().top - 60 }, 400);
    }

    function updateGridLayout() {
        const grid = $('.results-grid');
        const structureVisible = !$('#structure-card').hasClass('hidden');
        const costVisible = !$('#cost-card').hasClass('hidden');
        const performanceVisible = !$('#performance-card').hasClass('hidden');
        const terraformVisible = !$('#terraform-card').hasClass('hidden');
        const cliVisible = !$('#cli-card').hasClass('hidden');

        grid.removeClass('two-column three-column');

        const visibleCount = [structureVisible, costVisible, performanceVisible, terraformVisible, cliVisible].filter(Boolean).length;

        if (visibleCount === 3) {
            grid.addClass('three-column');
            $('#structure-card').css('order', '1');
            $('#cost-card').css('order', '2');
            $('#performance-card').css('order', '3');
            // Prefer CLI before Terraform when both present in 3-card layout
            if (cliVisible) {
                $('#cli-card').css('order', '4');
                $('#terraform-card').css('order', '5');
            } else {
                $('#terraform-card').css('order', '4');
            }
        } else if (visibleCount === 2) {
            grid.addClass('two-column');
            if (structureVisible && terraformVisible && !costVisible) {
                $('#structure-card').css('order', '1');
                $('#terraform-card').css('order', '2');
            } else if (structureVisible && costVisible && !terraformVisible) {
                $('#structure-card').css('order', '1');
                $('#cost-card').css('order', '2');
            } else if (costVisible && terraformVisible && !structureVisible) {
                $('#cost-card').css('order', '1');
                $('#terraform-card').css('order', '2');
            } else if (costVisible && cliVisible && !structureVisible) {
                $('#cost-card').css('order', '1');
                $('#cli-card').css('order', '2');
            } else if (structureVisible && cliVisible && !costVisible) {
                $('#structure-card').css('order', '1');
                $('#cli-card').css('order', '2');
            } else if (costVisible && performanceVisible) {
                $('#cost-card').css('order', '1');
                $('#performance-card').css('order', '2');
            } else if (structureVisible && performanceVisible) {
                $('#structure-card').css('order', '1');
                $('#performance-card').css('order', '2');
            }
        } else if (visibleCount >= 4) {
            $('#structure-card').css('order', '1');
            $('#cost-card').css('order', '2');
            $('#performance-card').css('order', '3');
            $('#cli-card').css('order', '4');
            $('#terraform-card').css('order', '5');
        }
    }
    
    $('#copy-terraform').on('click', function() {
        const txt = $('#terraform-text').text() || '';
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
    });

    $('#copy-cli').on('click', function() {
        const txt = $('#cli-text').text() || '';
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
    });

    $('#clear-all-btn').on('click', function() {
        if (confirm('Are you sure you want to clear all results? This will remove all saved outputs.')) {
            localStorage.removeItem('devops_cost');
            localStorage.removeItem('devops_performance');
            localStorage.removeItem('devops_structure');
            localStorage.removeItem('devops_terraform');
            localStorage.removeItem('devops_cli');
            
            $('#cost-card').addClass('hidden');
            $('#performance-card').addClass('hidden');
            $('#structure-card').addClass('hidden');
            $('#terraform-card').addClass('hidden');
            $('#cli-card').addClass('hidden');
            
            $('#generate-terraform-btn').hide();
            $('#generate-cli-btn').hide();
            $('#clear-all-btn').hide();
            
            updateGridLayout();
        }
    });

    function checkAndShowClearButton() {
        const hasAnyResults = !$('#cost-card').hasClass('hidden') || 
                              !$('#performance-card').hasClass('hidden') || 
                              !$('#structure-card').hasClass('hidden') || 
                              !$('#terraform-card').hasClass('hidden') ||
                              !$('#cli-card').hasClass('hidden');
        
        if (hasAnyResults) {
            $('#clear-all-btn').fadeIn();
        } else {
            $('#clear-all-btn').hide();
        }
    }

    const savedCost = localStorage.getItem('devops_cost');
    if (savedCost && savedCost.trim().length > 0) {
        const card = $('#cost-card');
        const box = $('#cost-text');
        box.text(savedCost);
        card.removeClass('hidden');
        const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(savedCost);
        $('#download-cost').attr('href', href);
    }
    
    const savedPerformance = localStorage.getItem('devops_performance');
    if (savedPerformance && savedPerformance.trim().length > 0) {
        const card = $('#performance-card');
        const box = $('#performance-text');
        box.text(savedPerformance);
        card.removeClass('hidden');
        const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(savedPerformance);
        $('#download-performance').attr('href', href);
    }
    
    const savedStructure = localStorage.getItem('devops_structure');
    if (savedStructure && savedStructure.trim().length > 0) {
        const card = $('#structure-card');
        const box = $('#structure-text');
        box.text(savedStructure);
        card.removeClass('hidden');
        const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(savedStructure);
        $('#download-structure').attr('href', href);
        $('#generate-terraform-btn').fadeIn();
        $('#generate-cli-btn').fadeIn();
    }
    
    const savedTerraform = localStorage.getItem('devops_terraform');
    if (savedTerraform && savedTerraform.trim().length > 0) {
        const card = $('#terraform-card');
        const box = $('#terraform-text');
        box.text(savedTerraform);
        card.removeClass('hidden');
        const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(savedTerraform);
        $('#download-terraform').attr('href', href);
    }

    const savedCli = localStorage.getItem('devops_cli');
    if (savedCli && savedCli.trim().length > 0) {
        const card = $('#cli-card');
        const box = $('#cli-text');
        box.text(savedCli);
        card.removeClass('hidden');
        const href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(savedCli);
        $('#download-cli').attr('href', href);
    }

    updateGridLayout();
    checkAndShowClearButton();

    function escapeHtml(str) {
        return (str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function stripCodeFences(text) {
        if (!text) return '';
        // Remove leading/trailing ``` blocks
        const lines = text.split(/\r?\n/);
        if (lines[0].trim().startsWith('```')) {
            // find last fence
            let lastIdx = lines.length - 1;
            while (lastIdx > 0 && !lines[lastIdx].trim().startsWith('```')) lastIdx--;
            const core = lines.slice(1, lastIdx > 0 ? lastIdx : undefined).join('\n');
            return core;
        }
        return text;
    }

    // Load history function (for history page)
    window.loadHistory = function() {
        const toastId = showToast('loading', 'Loading History', 'Fetching your recent activity...', 0);
        $.ajax({
            url: '/history',
            method: 'GET',
            success: function(payload) {
                try {
                    const items = (payload && payload.history) ? payload.history : [];
                    window.__historyItems = items; // cache for filtering
                    renderHistory('all');
                    updateToast(toastId, 'success', 'History Loaded', 'Recent activity displayed.');
                } catch (e) {
                    updateToast(toastId, 'error', 'History Error', 'Could not parse history.');
                }
            },
            error: function(xhr) {
                updateToast(toastId, 'error', 'History Failed', xhr.responseText || 'Network error.');
            }
        });
    };

    function renderHistory(filter) {
        const items = (window.__historyItems || []).filter(it => filter === 'all' ? true : it.type === filter);
        const $list = $('#history-list');
        if (items.length === 0) {
            $list.html('<p style="color:#666;">No history yet for this filter.</p>');
            return;
        }
        let html = '';
        const typeLabels = { 
            cost: ' Cost Best Practices', 
            performance: ' Performance Best Practices', 
            structure: '📁 Project Structure', 
            terraform: ' Terraform', 
            cli: ' Infra CLI' 
        };
        items.forEach((item) => {
            const typeLabel = typeLabels[item.type] || item.type.toUpperCase();
            const ts = new Date(item.created_at).toLocaleString();
            const badges = [
                item.provider ? `<span class="badge purple">${escapeHtml(item.provider)}</span>` : '',
                item.scale ? `<span class="badge">${escapeHtml(item.scale)}</span>` : '',
                item.country ? `<span class="badge">${escapeHtml(item.country)}</span>` : ''
            ].join('');

            const inputText = item.prompt || 'No input recorded';
            const inputHtml = escapeHtml(inputText);
            let resultText = item.result || 'No output recorded';
            // Special handling for structure: strip code fences and render as code block (no wrap)
            const isStructure = item.type === 'structure';
            if (isStructure) {
                resultText = stripCodeFences(resultText);
            }
            const resultHtml = escapeHtml(resultText);

            // Build download payload: for cost/performance/structure include both input and output
            const includeIO = ['cost', 'performance', 'structure'].includes(item.type);
            const downloadText = includeIO
                ? `Input\n${inputText}\n\nOutput\n${resultText}`
                : (item.result || '');

            html += `
                <div class="history-item">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <div class="title">${typeLabel}</div>
                        <div class="meta">${ts}</div>
                    </div>
                    <div class="badges">${badges}</div>
                    <details>
                        <summary> Input</summary>
                        <pre class="${isStructure ? '' : ''}" style="max-height:220px; overflow:auto">${inputHtml}</pre>
                    </details>
                    <details>
                        <summary> Output</summary>
                        <pre class="${isStructure ? 'code-block' : ''}" style="max-height:${isStructure ? '520px' : '380px'}; overflow:auto">${resultHtml}</pre>
                    </details>
                    <div style="margin-top:10px; display:flex; gap:8px;">
                        <button class="btn" data-copy="${items.indexOf(item)}">Copy Output</button>
                        <a class="btn" href="data:text/plain;charset=utf-8,${encodeURIComponent(downloadText)}" download="${item.type}_${item.id}.txt">Download</a>
                    </div>
                </div>`;
        });
        $list.html(html);

        // Copy handlers
        $list.find('button[data-copy]').on('click', function(){
            const idx = Number($(this).attr('data-copy'));
            const it = items[idx];
            if (it && navigator.clipboard) navigator.clipboard.writeText(it.result || '');
        });
    }

    // Toolbar interactions
    $(document).on('click', '.history-toolbar .chip', function(){
        $('.history-toolbar .chip').removeClass('active');
        $(this).addClass('active');
        const filter = $(this).data('filter');
        renderHistory(filter);
    });
    $(document).on('click', '#expand-all', function(){
        $('#history-list details').attr('open', true);
    });
    $(document).on('click', '#collapse-all', function(){
        $('#history-list details').removeAttr('open');
    });
});