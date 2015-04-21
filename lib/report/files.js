/*
 Copyright (c) 2012, Yahoo! Inc.  All rights reserved.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

var path = require('path'),
    mkdirp = require('mkdirp'),
    util = require('util'),
    fs = require('fs'),
    Report = require('./index'),
    utils = require('../object-utils');

/**
 * a `Report` implementation that produces files output in a detailed table.
 *
 * Usage
 * -----
 *
 *      var report = require('istanbul').Report.create('files');
 *
 * @class FilesReport
 * @extends Report
 * @module report
 * @constructor
 * @param {Object} opts optional
 * @param {String} [opts.dir] the directory in which to the files coverage report will be written, when writing to a file
 * @param {String} [opts.file] the filename for the report. When omitted, the report is written to console
 * @param {Number} [opts.maxCols] the max column width of the report. By default, the width of the report is adjusted based on the length of the paths
 *              to be reported.
 */
function FilesReport(opts) {
    Report.call(this);
    opts = opts || {};
    this.dir = opts.dir || process.cwd();
    this.file = opts.file;
    this.summary = opts.summary;
    this.maxCols = opts.maxCols || 0;
}

FilesReport.TYPE = 'files';
util.inherits(FilesReport, Report);

function padding(num, ch) {
    var str = '',
        i;
    ch = ch || ' ';
    for (i = 0; i < num; i += 1) {
        str += ch;
    }
    return str;
}

function fill(str, width, right) {
    str = String(str);

    var remaining = width,
        fmtStr = '',
        fillStr,
        strlen = str.length;

    if (remaining > 0) {
        if (remaining >= strlen) {
            fillStr = padding(remaining - strlen);
            fmtStr = right ? fillStr + str : str + fillStr;
        } else {
            fmtStr = str.substring(strlen - remaining);
            fmtStr = '... ' + fmtStr.substring(4);
        }
    }

    return fmtStr;
}

Report.mix(FilesReport, {
    synopsis: function () {
        return 'files report that prints a coverage line for every file, typically to console';
    },
    getDefaultConfig: function () {
        return { file: null, maxCols: 0 };
    },
    writeReport: function (collector /*, sync */) {
        var text;

        text = collector.files().map(function (key) {
            var summary = utils.summarizeFileCoverage(collector.fileCoverageFor(key));
            return key + '\n' + Object.keys(summary).map(function (summaryType) {
                return '\t' + fill(summaryType, 15) + summary[summaryType].covered;
            }).join('\n');
        }).join('\n') + '\n';

        if (this.file) {
            mkdirp.sync(this.dir);
            fs.writeFileSync(path.join(this.dir, this.file), text, 'utf8');
        } else {
            console.log(text);
        }
        this.emit('done');
    }
});

module.exports = FilesReport;
