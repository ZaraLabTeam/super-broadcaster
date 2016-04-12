String.prototype.formatPV = function(args) {
	if (!args) return this;

	var str = this;

	for (var arg in args) {
		str = str.replace(
			RegExp("\\{\\{" + arg + "\\}\\}", "gi"), args[arg]);
	}

	return str;
};

Array.prototype.cleanPV = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};
