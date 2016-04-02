String.prototype.formatPV = function(args) {
	if (!args) return this;

	var str = this;

	for (var arg in args) {
		str = str.replace(
			RegExp("\\{\\{" + arg + "\\}\\}", "gi"), args[arg]);
	}

	return str;
};
