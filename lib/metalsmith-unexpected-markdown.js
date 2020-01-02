/* global global */
var UnexpectedMarkdown = require('unexpected-markdown');
var basename = require('path').basename;
var debug = require('debug')('metalsmith-unexpected-markdown');
var dirname = require('path').dirname;
var resolve = require('path').resolve;
var extname = require('path').extname;
var fs = require('fs');
var async = require('async');
var extend = require('extend');

module.exports = function plugin(pluginOptions) {
    pluginOptions = pluginOptions || {};

    return function (files, metalsmith, next) {
        var sourcePath = metalsmith.source();

        async.series([
            function (cb) {
                var markdownFiles = Object.keys(files).filter(function (file) {
                    return /\.md|\.markdown/.test(extname(file));
                }).sort();

                async.eachSeries(markdownFiles, function (file, cb) {
                    debug('checking file: %s', file);
                    var theme = files[file].theme;
                    var data = files[file];
                    var content = data.contents.toString();
                    var options = extend({}, { theme: theme }, pluginOptions);

                    var markdown = new UnexpectedMarkdown(content);
                    var tasks = [];
                    if (options.updateExamples) {
                        tasks.push(function (cb) {
                            markdown.withUpdatedExamples(options).then(function (updatedMarkdown) {
                                markdown = updatedMarkdown;
                                cb();
                            }).catch(cb);
                        });
                        tasks.push(function (cb) {
                            debug('updating examples in file: %s', file);
                            var absoluteFilePath = resolve(sourcePath, file);
                            async.waterfall([
                                function (cb) {
                                    // read file again to avoid removing metadata from the file
                                    fs.readFile(absoluteFilePath, cb);
                                },
                                function (data, cb) {
                                    new UnexpectedMarkdown(data.toString()).withUpdatedExamples(options).then(function (markdownForFile) {
                                        cb(null, markdownForFile);
                                    }).catch(cb);
                                },
                                function (markdown, cb) {
                                    fs.writeFile(absoluteFilePath, markdown.toString(), 'utf8', cb);
                                }
                            ], cb);
                        });
                    }

                    tasks.push(function (cb) {
                        async.waterfall([
                            function (cb) {
                                debug('generating html for: %s', file);
                                markdown.toHtml(options).then(function (html) {
                                    cb(null, html);
                                }).catch(cb);
                            },
                            function (html, cb) {
                                data.contents = Buffer.from(html);
                                delete files[file];
                                debug('converting file: %s', file);
                                var dir = dirname(file);
                                var htmlFile = basename(file, extname(file)) + '.html';
                                if ('.' !== dir) { htmlFile = dir + '/' + htmlFile; }
                                files[htmlFile] = data;
                                cb();
                            }
                        ], cb);
                    });

                    async.series(tasks, cb);
                }, cb);
            }
        ], next);
    };
};
