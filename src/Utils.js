
const fs = require('fs');

function TryMakeDir(path) {
	try {
		fs.mkdirSync(path)
	} catch (err) {
		if (err.code !== 'EEXIST' & err.code !== 'ENOENT') throw err
	}
}

function RemoveExtension(path) {
	let filePath = path;
	let lastDotIndex = path.lastIndexOf(".");
	if (lastDotIndex >= 0) {
		filePath = path.slice(0, lastDotIndex);
	}
	return filePath
}

function MakePathRelative(fullPath) {
	let rootPath = process.cwd();
	let path = fullPath.replace(rootPath, "");

	return path;
}

exports.TryMakeDir = TryMakeDir;
exports.RemoveExtension = RemoveExtension;
exports.MakePathRelative = MakePathRelative;