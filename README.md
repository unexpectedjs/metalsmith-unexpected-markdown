A Metalsmith plugin for writing markdown with evaluated examples and
syntax highlighting.

This Metalsmith plugin uses the markdown parser
[unexpected-markdown](https://github.com/unexpectedjs/unexpected-markdown) to generate html output from
markdown files. In addition to what [marked](https://github.com/chjj/marked) already offers, this plugin
uses [magicpen-prism](,https://github.com/unexpectedjs/magicpen-prism)
to syntax highlight code blocks and uses
[unexpected](http://unexpectedjs.github.io/) to evaluate JavaScript
code examples.

Right now the documentation for this plugin is pretty lacking, until
that is fixed the best example on how to use the plugin is to look at
how it is used in
[unexpected](http://unexpectedjs.github.io/).

```js
metalSmith(__dirname)
    .destination('../site-build')
    .source('src')
    .use(require('metalsmith-collections')({
        pages: {
            pattern: '*.md'
        }
    }))
    .use(require('metalsmith-unexpected-markdown')({
        unexpected: require('../lib/'),
        testFile: path.resolve(__dirname, '..', 'test', 'documentation.spec.js'),
        updateExamples: 'update-examples' in argv
    }));
```

Options:

* _unexpected_: (Optional) instead of letting the plugin require
  unexpected, you can pass an instance.
* _testFile_: (Optional) if you specify a path for a test file, a test
  file will be generated containing evaluations of all the examples in
  the markdown files.
* _updateExamples_: (Optional) setting this option to true, updates
  the expected output in all the markdown files. This is useful when
  you do a lot of validation on the error output of examples.

An example is a JavaScript code block:

    ```js
    helloWorld()
    ```

If you expect the example to fail, you can follow the code block with
an expected output block:

    ```output
    Error: Silence this is a library!
    ```

That are a few things you can achieve more then what is explained
above, like async examples with promises and skiping examples for
different environments or just skipping evaluation altogether. For now
you'll have to look at how
[unexpected](http://unexpectedjs.github.io/)
does it to learn the ticks.
