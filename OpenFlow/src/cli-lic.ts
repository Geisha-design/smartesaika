#!/usr/bin/env node
import * as fs from "fs";
import { Logger } from './Logger';
Logger.configure(true, true);
Logger.enabled["cli-lic"] = 7
import { Config } from "./Config";

import { NoderedUtil } from "@openiap/openflow-api";
import { i_license_data } from "./commoninterfaces";
function printusage() {
    Logger.instanse.info("cli-lic", "", "openflow-cli [--months 3][--email email] domain");
    Logger.instanse.info("cli-lic", "", "   --months - Set number of months, default 3");
    Logger.instanse.info("cli-lic", "", "   --email - email to use in license");
    Logger.instanse.info("cli-lic", "", "   domain - Generate ofid and create v2 license");
    Logger.instanse.info("cli-lic", "", "Requires private key to be in ./config/private_key.pem");
}
const optionDefinitions = [
    { name: 'email', type: String },
    { name: 'months', type: Number },
    { name: 'domain', type: String, defaultOption: true }
]


let _lic_require: any = null;
try {
    _lic_require = require("./ee/license-file");
} catch (error) {
}
if (_lic_require != null) {
    Logger.License = new _lic_require.LicenseFile();
} else {
    Logger.License = {} as any;
    Logger.License.ofid = function () {
        if (!NoderedUtil.IsNullEmpty(this._ofid)) return this._ofid;
        var crypto = require('crypto');
        const openflow_uniqueid = Config.openflow_uniqueid || crypto.createHash('md5').update(Config.domain).digest("hex");
        Config.openflow_uniqueid = openflow_uniqueid;
        this._ofid = openflow_uniqueid;
        return openflow_uniqueid;
    };
}

const commandLineArgs = require('command-line-args');
let options = null;
try {
    options = commandLineArgs(optionDefinitions, { partial: true });
    let months: number = 3;
    if (!options.email && !options.domain) { throw new Error("Domain is mandatory"); }
    if (!options.email) options.email = "";
    if (options.months) {
        months = parseInt(options.months);
    }
    if (options._unknown) {
        Logger.instanse.info("cli-lic", "", "Unknown param " + options._unknown)
        process.exit();
    }
    if (!fs.existsSync('config/private_key.pem')) {
        Logger.instanse.info("cli-lic", "", "no such file or directory, open config/private_key.pem");
        process.exit();
    }
    const data: i_license_data = {} as any;
    let template = Logger.License.template_v1;
    data.licenseVersion = 1;
    data.email = options.email;
    if (options.domain) {
        template = Logger.License.template_v2;
        data.licenseVersion = 2;
        data.domain = options.domain;
    }
    var dt = new Date(new Date().toISOString());
    dt.setMonth(dt.getMonth() + months);
    data.expirationDate = dt.toISOString() as any;
    const licenseFileContent = Logger.License.generate({
        privateKeyPath: 'config/private_key.pem',
        template,
        data: data
    });
    Logger.usecolors = false;
    Logger.instanse.info("cli-lic", "", Buffer.from(licenseFileContent).toString('base64'));
    process.exit();
} catch (error) {
    Logger.instanse.error("cli-lic", "", error.message ? error.message : error);
    printusage();
    process.exit();
}
// node C:\code\openflow\dist\cli-lic.js --months 1 localhost.openiap.io
// openflow-lic --months 1 localhost.openiap.io | clip
