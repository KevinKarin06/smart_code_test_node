const fs = require("fs");

class Utils {
    static deleteFile(path) {
        if (path != null || path != undefined) {
            fs.access(path, fs.F_OK, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                fs.unlink(path, (err) => {
                    if (err) {
                        console.log("Error Deleting Files", err);
                        return;
                    } else console.log("File Deleted");
                });
            });
        }
    }

}
module.exports = Utils;
