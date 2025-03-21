// Immediately Invoked Function Expression (IIFE) to create a local scope and avoid polluting the global namespace
!function(modules){
    // Function to load a module and cache it
    function require(moduleId) {
        // Check if the module is already cached
        if(installedModules[moduleId])
            return installedModules[moduleId].exports;

        // Create a new module (and put it into the cache)
        var module = installedModules[moduleId] = {
            exports: {},
            id: moduleId,
            loaded: false
        };

        // Execute the module function
        modules[moduleId].call(module.exports, module, module.exports, require);

        // Flag the module as loaded
        module.loaded = true;

        // Return the exports of the module
        return module.exports;
    }

    // Cache to store loaded modules
    var installedModules = {};

    // Load entry module and return exports
    return require(0);
}([
    // Define modules array
    function(module, exports, require) {
        // Function to load a template and cache it
        function loadTemplate(name, type, data) {
            return new Promise(function(resolve) {
                loadTemplateEngine(type).then(function() {
                    templates[name] = {template: compileTemplate(type)(data.trim()), type: type};
                    resolve(templates[name]);
                });
            });
        }

        // Function to render a template based on type
        function renderTemplate(template, type, data) {
            switch(type) {
                case 'handlebars':
                    return template(data);
                case 'jade':
                    return template(data);
                case 'mustache':
                    return Mustache.render(template, data);
                case 'nunjucks':
                    return template.render(data);
                default:
                    return customRender(template, data);
            }
        }

        // Function to get a template from the DOM or load it via AJAX
        function getTemplate(selector, type) {
            var script = document.querySelector(selector),
                templateType = script.getAttribute("type"),
                templateContent = script.innerHTML;

            if (!type) {
                if (!templateType) throw new Error("Must provide `type` attribute for <script> templates (e.g., handlebars, jade, nunjucks, html)");
                if (templateType.indexOf("handlebars") !== -1) type = 'handlebars';
                else if (templateType.indexOf("jade") !== -1) type = 'jade';
                else if (templateType.indexOf("mustache") !== -1) type = 'mustache';
                else if (templateType.indexOf("nunjucks") !== -1) type = 'nunjucks';
                else if (templateType.indexOf("html") === -1) return console.error("Template type could not be inferred from the script tag. Please add a type.");
                type = 'html';
            }

            return new Promise(function(resolve) {
                loadTemplate(selector, type, templateContent).then(function(template) {
                    resolve(template, type);
                });
            });
        }

        // Function to load template via AJAX
        function loadTemplateViaAjax(url, type) {
            return new Promise(function(resolve) {
                var xhr = new XMLHttpRequest();
                xhr.addEventListener("load", function() {
                    loadTemplate(url, type, xhr.response).then(function(template) {
                        resolve(template, type);
                    });
                });
                xhr.open("GET", url);
                xhr.send();
            });
        }

        // Function to compile a template based on type
        function compileTemplate(type) {
            switch (type) {
                case 'handlebars':
                    return Handlebars.compile;
                case 'jade':
                    return jade.compile;
                case 'mustache':
                    return Handlebars.compile;
                case 'nunjucks':
                    return nunjucks.compile;
                default:
                    return function(template) {
                        return template;
                    };
            }
        }

        // Function to load the template engine script
        function loadTemplateEngine(type) {
            return new Promise(function(resolve) {
                if (!type || type === 'html') return resolve();

                var script = templateEngines[type];
                if (templateEngines[type] === true) return resolve();

                if (!script) {
                    script = document.createElement("script");
                    templateEngines[type] = script;
                    script.setAttribute("src", templateEngineUrls[type]);
                    console.info('Lazy-loading %s engine. Please add <script src="%s"> to your page.', type, templateEngineUrls[type]);
                    document.body.appendChild(script);
                }

                var onload = script.onload || function() {};
                script.onload = function() {
                    onload();
                    templateEngines[type] = true;
                    resolve();
                };
            });
        }

        // Utility functions and variables
        var customRender = require(11),
            debug = AFRAME.utils.debug,
            extend = AFRAME.utils.extend,
            templates = {},
            logError = debug("template-component:error"),
            logInfo = debug("template-component:info"),
            templateTypes = {
                handlebars: "handlebars",
                jade: "jade",
                mustache: "mustache",
                nunjucks: "nunjucks",
                html: "html"
            },
            templateEngines = {
                handlebars: !!window.Handlebars,
                jade: !!window.jade,
                mustache: !!window.Mustache,
                nunjucks: !!window.nunjucks
            },
            templateEngineUrls = {
                handlebars: "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js",
                jade: "https://cdnjs.cloudflare.com/ajax/libs/jade/1.11.0/jade.min.js",
                mustache: "https://cdnjs.cloudflare.com/ajax/libs/mustache.js/2.2.1/mustache.min.js",
                nunjucks: "https://cdnjs.cloudflare.com/ajax/libs/nunjucks/2.3.0/nunjucks.min.js"
            };

        // Register A-Frame component for template
        AFRAME.registerComponent("template", {
            schema: {
                insert: {default: "beforeend"},
                type: {default: ""},
                src: {default: ""},
                data: {default: ""}
            },
            update: function(oldData) {
                var data = this.data,
                    el = this.el,
                    getTemplateFn = data.src[0] === "#" ? getTemplate : loadTemplateViaAjax,
                    cachedTemplate = templates[data.src];

                if (oldData && oldData.src !== data.src) {
                    while (el.firstChild) {
                        el.removeChild(el.firstChild);
                    }
                }

                if (cachedTemplate) {
                    this.renderTemplate(cachedTemplate);
                } else {
                    getTemplateFn(data.src, data.type).then(this.renderTemplate.bind(this));
                }
            },
            renderTemplate: function(template) {
                var el = this.el,
                    data = this.data,
                    templateData = {};

                Object.keys(el.dataset).forEach(function(key) {
                    templateData[key] = el.dataset[key];
                });

                if (data.data) {
                    templateData = extend(templateData, el.getAttribute(data.data));
                }

                var renderedTemplate = renderTemplate(template.template, template.type, templateData);
                el.insertAdjacentHTML(data.insert, renderedTemplate);
                el.emit("templaterendered");
            }
        });

        // Register A-Frame component for template-set
        AFRAME.registerComponent("template-set", {
            schema: {
                on: {type: "string"},
                src: {type: "string"},
                data: {type: "string"}
            },
            init: function() {
                var data = this.data,
                    el = this.el;

                el.addEventListener(data.on, function() {
                    el.setAttribute("template", {src: data.src, data: data.data});
                });
            }
        });
    },
    // Additional modules...
]);
