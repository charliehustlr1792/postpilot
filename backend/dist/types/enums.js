"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = exports.PostStatus = void 0;
var PostStatus;
(function (PostStatus) {
    PostStatus["DRAFT"] = "DRAFT";
    PostStatus["SCHEDULED"] = "SCHEDULED";
    PostStatus["PUBLISHED"] = "PUBLISHED";
    PostStatus["FAILED"] = "FAILED";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
var Platform;
(function (Platform) {
    Platform["TWITTER"] = "TWITTER";
    Platform["LINKEDIN"] = "LINKEDIN";
    Platform["INSTAGRAM"] = "INSTAGRAM";
    Platform["FACEBOOK"] = "FACEBOOK";
})(Platform || (exports.Platform = Platform = {}));
