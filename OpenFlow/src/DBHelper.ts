import { Crypt } from "./Crypt";
import { User, Role, Rolemember, WellknownIds, Rights, NoderedUtil, Base, TokenUser } from "@openiap/openflow-api";
import { Config } from "./Config";
import { Span } from "@opentelemetry/api";
import { Logger } from "./Logger";
import { Auth } from "./Auth";
import { WebSocketServerClient } from "./WebSocketServerClient";
var cacheManager = require('cache-manager');
var redisStore = require('cache-manager-ioredis');

export class DBHelper {

    public static memoryCache: any;
    public static async init() {
        if (!NoderedUtil.IsNullUndefinded(this.memoryCache)) return;
        if (Config.cache_store_type == "redis") {
            this.memoryCache = cacheManager.caching({
                store: redisStore,
                host: Config.cache_store_redis_host,
                port: Config.cache_store_redis_port,
                password: Config.cache_store_redis_password,
                db: 0,
                ttl: 3600
            })
            // listen for redis connection error event
            var redisClient = this.memoryCache.store.getClient();
            redisClient.on('error', (error) => {
                console.log(error);
            });
            return;
        }
        this.memoryCache = cacheManager.caching({ store: 'memory', max: 100, ttl: 3600 /*seconds*/ });
    }
    public static async clearCache(reason: string) {
        this.init();
        // Auth.ensureotel();
        this.memoryCache.reset();
        if (Config.log_cache) Logger.instanse.debug("clearCache called with reason: " + reason);
    }
    public static async DeleteKey(key) {
        this.init();
        if (Config.log_cache) Logger.instanse.debug("Remove from cache : " + key);
        this.memoryCache.del(key);
    }
    public static async FindById(_id: string, jwt: string, parent: Span): Promise<User> {
        this.init();
        const span: Span = Logger.otel.startSubSpan("dbhelper.FindById", parent);
        try {
            if (NoderedUtil.IsNullEmpty(_id)) return null;
            let item = await this.memoryCache.wrap("user" + _id, () => {
                if (jwt === null || jwt == undefined || jwt == "") { jwt = Crypt.rootToken(); }
                if (Config.log_cache) Logger.instanse.debug("Add user to cache : " + _id);
                return Config.db.getbyid<User>(_id, "users", jwt, true, span);;
            });
            if (NoderedUtil.IsNullUndefinded(item)) return null;
            return this.DecorateWithRoles(User.assign(item), span);
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async FindQueueById(_id: string, jwt: string, parent: Span): Promise<User> {
        this.init();
        const span: Span = Logger.otel.startSubSpan("dbhelper.FindById", parent);
        try {
            if (NoderedUtil.IsNullEmpty(_id)) return null;
            let item = await this.memoryCache.wrap("queue" + _id, () => {
                if (jwt === null || jwt == undefined || jwt == "") { jwt = Crypt.rootToken(); }
                if (Config.log_cache) Logger.instanse.debug("Add queue to cache : " + _id);
                return Config.db.getbyid<User>(_id, "mq", jwt, true, span);
            });
            if (NoderedUtil.IsNullUndefinded(item)) return null;
            return this.DecorateWithRoles(User.assign(item), span);
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async FindQueueByName(name: string, jwt: string, parent: Span): Promise<User> {
        this.init();
        const span: Span = Logger.otel.startSubSpan("dbhelper.FindById", parent);
        try {
            if (NoderedUtil.IsNullEmpty(name)) return null;
            let item = await this.memoryCache.wrap("queue" + name, () => {
                if (jwt === null || jwt == undefined || jwt == "") { jwt = Crypt.rootToken(); }
                if (Config.log_cache) Logger.instanse.debug("Add queue to cache : " + name);
                return Config.db.getbyname<User>(name, "mq", jwt, true, span);
            });
            if (NoderedUtil.IsNullUndefinded(item)) return null;
            return this.DecorateWithRoles(User.assign(item), span);
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async FindExchangeById(_id: string, jwt: string, parent: Span): Promise<User> {
        this.init();
        const span: Span = Logger.otel.startSubSpan("dbhelper.FindById", parent);
        try {
            if (NoderedUtil.IsNullEmpty(_id)) return null;
            let item = await this.memoryCache.wrap("exchange" + _id, () => {
                if (jwt === null || jwt == undefined || jwt == "") { jwt = Crypt.rootToken(); }
                if (Config.log_cache) Logger.instanse.debug("Add exchange to cache : " + _id);
                return Config.db.getbyid<User>(_id, "mq", jwt, true, span);
            });
            if (NoderedUtil.IsNullUndefinded(item)) return null;
            return this.DecorateWithRoles(User.assign(item), span);
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async FindExchangeByName(name: string, jwt: string, parent: Span): Promise<User> {
        this.init();
        const span: Span = Logger.otel.startSubSpan("dbhelper.FindById", parent);
        try {
            if (NoderedUtil.IsNullEmpty(name)) return null;
            let item = await this.memoryCache.wrap("exchange" + name, () => {
                if (jwt === null || jwt == undefined || jwt == "") { jwt = Crypt.rootToken(); }
                if (Config.log_cache) Logger.instanse.debug("Add exchange to cache : " + name);
                return Config.db.getbyname<User>(name, "mq", jwt, true, span);
            });
            if (NoderedUtil.IsNullUndefinded(item)) return null;
            return this.DecorateWithRoles(User.assign(item), span);
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async FindRoleById(_id: string, jwt: string, parent: Span): Promise<Role> {
        this.init();
        const span: Span = Logger.otel.startSubSpan("dbhelper.FindById", parent);
        try {
            if (NoderedUtil.IsNullEmpty(_id)) return null;
            let item = await this.memoryCache.wrap("role" + _id, () => {
                if (jwt === null || jwt == undefined || jwt == "") { jwt = Crypt.rootToken(); }
                if (Config.log_cache) Logger.instanse.debug("Add role to cache : " + _id);
                return Config.db.getbyid<User>(_id, "users", jwt, true, span);
            });
            if (NoderedUtil.IsNullUndefinded(item)) return null;
            return Role.assign(item);
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async FindByUsername(username: string, jwt: string, parent: Span): Promise<User> {
        this.init();
        const span: Span = Logger.otel.startSubSpan("dbhelper.FindByUsername", parent);
        try {
            if (NoderedUtil.IsNullEmpty(username)) return null;
            let item = await this.memoryCache.wrap("username" + username, () => {
                if (jwt === null || jwt == undefined || jwt == "") { jwt = Crypt.rootToken(); }
                if (Config.log_cache) Logger.instanse.debug("Add user to cache : " + username);
                return Config.db.getbyusername<User>(username, jwt, true, span);
            });
            if (NoderedUtil.IsNullUndefinded(item)) return null;
            return this.DecorateWithRoles(User.assign(item), span);
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async FindByUsernameOrId(username: string, id: string, parent: Span): Promise<User> {
        this.init();
        const span: Span = Logger.otel.startSubSpan("dbhelper.FindByUsernameOrId", parent);
        try {
            var user = await this.FindById(id, null, span);
            if (user == null) user = await this.FindByUsername(username, null, span);
            return user;
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async FindByUsernameOrFederationid(username: string, parent: Span): Promise<User> {
        var result = await this.FindByUsername(username, null, parent);
        return result;
    }
    public static async DecorateWithRoles<T extends TokenUser | User>(user: T, parent: Span): Promise<T> {
        this.init();
        const span: Span = Logger.otel.startSubSpan("dbhelper.DecorateWithRoles", parent);
        try {
            if (NoderedUtil.IsNullUndefinded(user)) return null;
            let cached_roles = await this.memoryCache.wrap("allroles", () => {
                if (Config.log_cache) Logger.instanse.debug("Add all roles");
                return Config.db.query<Role>({ query: { _type: "role" }, projection: { "name": 1, "members": 1 }, top: Config.expected_max_roles, collectionname: "users", jwt: Crypt.rootToken() }, span);
            });
            if (cached_roles.length === 0 && user.username !== "root") {
                throw new Error("System has no roles !!!!!!");
            }
            user.roles = [];
            for (let role of cached_roles) {
                let isMember: number = -1;
                if (role.members !== undefined) { isMember = role.members.map(function (e: Rolemember): string { return e._id; }).indexOf(user._id); }
                if (isMember > -1) {
                    user.roles.push(new Rolemember(role.name, role._id));
                }
            }
            let hasusers = user.roles.filter(x => x._id == WellknownIds.users);
            if (hasusers.length == 0) {
                user.roles.push(new Rolemember("users", WellknownIds.users));
            }
            let updated: boolean = false;
            do {
                updated = false;
                for (let userrole of user.roles) {
                    for (let role of cached_roles) {
                        let isMember: number = -1;
                        if (role.members !== undefined) { isMember = role.members.map(function (e: Rolemember): string { return e._id; }).indexOf(userrole._id); }
                        if (isMember > -1) {
                            const beenAdded: number = user.roles.map(function (e: Rolemember): string { return e._id; }).indexOf(role._id);
                            if (beenAdded === -1) {
                                user.roles.push(new Rolemember(role.name, role._id));
                                updated = true;
                            }
                        }
                    }
                }
            } while (updated)
            user.roles.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
        return user as any;
    }
    public static async FindRoleByName(name: string, parent: Span): Promise<Role> {
        this.init();
        const span: Span = Logger.otel.startSubSpan("dbhelper.FindByUsername", parent);
        try {
            let item = await this.memoryCache.wrap("rolename" + name, async () => {
                const items: Role[] = await Config.db.query<Role>({ query: { name: name, "_type": "role" }, top: 1, collectionname: "users", jwt: Crypt.rootToken() }, parent);
                if (items === null || items === undefined || items.length === 0) { return null; }
                if (Config.log_cache) Logger.instanse.debug("Add role to cache : " + name);
                return items[0];
            });
            if (NoderedUtil.IsNullUndefinded(item)) return null;
            return Role.assign(item);
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async Save(item: User | Role, jwt: string, parent: Span): Promise<void> {
        await Config.db._UpdateOne(null, item, "users", 2, false, jwt, parent);
    }
    public static async EnsureRole(jwt: string, name: string, id: string, parent: Span): Promise<Role> {
        const span: Span = Logger.otel.startSubSpan("dbhelper.EnsureRole", parent);
        try {
            let role: Role = await this.FindRoleByName(name, span);
            if (role == null) role = await this.FindRoleById(name, null, span);
            if (role !== null && (role._id === id || NoderedUtil.IsNullEmpty(id))) { return role; }
            if (role !== null && !NoderedUtil.IsNullEmpty(role._id)) { await Config.db.DeleteOne(role._id, "users", jwt, span); }
            role = new Role(); role.name = name; role._id = id;
            role = await Config.db.InsertOne(role, "users", 0, false, jwt, span);
            role = Role.assign(role);
            Base.addRight(role, WellknownIds.admins, "admins", [Rights.full_control]);
            Base.addRight(role, role._id, role.name, [Rights.full_control]);
            Base.removeRight(role, role._id, [Rights.delete]);
            await this.Save(role, jwt, span);
            return Role.assign(role);
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async EnsureUser(jwt: string, name: string, username: string, id: string, password: string, parent: Span): Promise<User> {
        const span: Span = Logger.otel.startSubSpan("dbhelper.ensureUser", parent);
        try {
            span?.addEvent("FindByUsernameOrId");
            let user: User = await this.FindByUsernameOrId(username, id, span);
            if (user !== null && (user._id === id || id === null)) { return user; }
            if (user !== null && id !== null) {
                span?.addEvent("FindByUsernameOrId");
                await Config.db.DeleteOne(user._id, "users", jwt, span);
            }
            user = new User(); user._id = id; user.name = name; user.username = username;
            if (password !== null && password !== undefined && password !== "") {
                span?.addEvent("SetPassword");
                await Crypt.SetPassword(user, password, span);
            } else {
                span?.addEvent("SetPassword");
                await Crypt.SetPassword(user, Math.random().toString(36).substr(2, 9), span);
            }
            span?.addEvent("Insert user");
            user = await Config.db.InsertOne(user, "users", 0, false, jwt, span);
            user = User.assign(user);
            span?.addEvent("DecorateWithRoles");
            user = await this.DecorateWithRoles(user, span);
            span?.addEvent("return user");
            return user;
        } catch (error) {
            span?.recordException(error);
            throw error;
        } finally {
            Logger.otel.endSpan(span);
        }
    }
    public static async EnsureNoderedRoles(user: TokenUser | User, jwt: string, force: boolean, parent: Span): Promise<void> {
        if (Config.auto_create_personal_nodered_group || force) {
            let name = user.username;
            name = name.split("@").join("").split(".").join("");
            name = name.toLowerCase();

            let noderedadmins = await DBHelper.FindRoleById(name + "noderedadmins", jwt, parent);
            if (noderedadmins == null) {
                noderedadmins = await this.EnsureRole(jwt, name + "noderedadmins", null, parent);
                Base.addRight(noderedadmins, user._id, user.username, [Rights.full_control]);
                Base.removeRight(noderedadmins, user._id, [Rights.delete]);
                noderedadmins.AddMember(user as User);
                await this.Save(noderedadmins, jwt, parent);
            }
        }
        if (Config.auto_create_personal_noderedapi_group || force) {
            let name = user.username;
            name = name.split("@").join("").split(".").join("");
            name = name.toLowerCase();

            let noderedadmins = await DBHelper.FindRoleById(name + "nodered api users", jwt, parent);
            if (noderedadmins == null) {
                noderedadmins = await this.EnsureRole(jwt, name + "nodered api users", null, parent);
                Base.addRight(noderedadmins, user._id, user.username, [Rights.full_control]);
                Base.removeRight(noderedadmins, user._id, [Rights.delete]);
                noderedadmins.AddMember(user as User);
                await this.Save(noderedadmins, jwt, parent);
            }
        }
    }
    public static async UpdateHeartbeat(cli: WebSocketServerClient): Promise<any> {
        const dt = new Date(new Date().toISOString());
        const updatedoc = { _heartbeat: dt, lastseen: dt };
        cli.user._heartbeat = dt; cli.user.lastseen = dt;
        if (cli.clientagent == "openrpa") {
            cli.user._rpaheartbeat = dt;
            // Config.db.synRawUpdateOne("users", { _id: cli.user._id },
            //     { $set: { ...updatedoc, _rpaheartbeat: new Date(new Date().toISOString()) } },
            //     Config.prometheus_measure_onlineuser, null);
            return { $set: { ...updatedoc, _rpaheartbeat: new Date(new Date().toISOString()) } };
        }
        if (cli.clientagent == "nodered") {
            cli.user._noderedheartbeat = dt;
            // Config.db.synRawUpdateOne("users", { _id: cli.user._id },
            //     { $set: { ...updatedoc, _noderedheartbeat: new Date(new Date().toISOString()) } },
            //     Config.prometheus_measure_onlineuser, null);
            return { $set: { ...updatedoc, _noderedheartbeat: new Date(new Date().toISOString()) } };
        }
        if (cli.clientagent == "webapp" || cli.clientagent == "aiotwebapp") {
            (cli.user as any)._webheartbeat = dt;
            // Config.db.synRawUpdateOne("users", { _id: cli.user._id },
            //     { $set: { ...updatedoc, _webheartbeat: new Date(new Date().toISOString()) } },
            //     Config.prometheus_measure_onlineuser, null);
            return { $set: { ...updatedoc, _webheartbeat: new Date(new Date().toISOString()) } };
        }
        if (cli.clientagent == "powershell") {
            cli.user._powershellheartbeat = dt;
            // Config.db.synRawUpdateOne("users", { _id: cli.user._id },
            //     { $set: { ...updatedoc, _powershellheartbeat: new Date(new Date().toISOString()) } },
            //     Config.prometheus_measure_onlineuser, null);
            return { $set: { ...updatedoc, _powershellheartbeat: new Date(new Date().toISOString()) } };
        }
        if (cli.clientagent == "mobileapp" || cli.clientagent == "aiotmobileapp") {
            (cli.user as any)._webheartbeat = dt;
            (cli.user as any)._mobilheartbeat = dt;
            // Config.db.synRawUpdateOne("users", { _id: cli.user._id },
            //     { $set: { ...updatedoc, _webheartbeat: new Date(new Date().toISOString()), _mobilheartbeat: new Date(new Date().toISOString()) } },
            //     Config.prometheus_measure_onlineuser, null);
            return { $set: { ...updatedoc, _webheartbeat: new Date(new Date().toISOString()), _mobilheartbeat: new Date(new Date().toISOString()) } };
        }
        else {
            // Should proberly turn this a little down, so we dont update all online users every 10th second
            // Config.db.synRawUpdateOne("users", { _id: cli.user._id },
            //     { $set: updatedoc, },
            //     Config.prometheus_measure_onlineuser, null);
            return { $set: updatedoc };
        }
    }
}