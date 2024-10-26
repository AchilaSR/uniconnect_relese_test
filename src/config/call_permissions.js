export default [
    // [/^1007$/, /^Ext\.(1008|1006|1003|1004|1024|1023|1002|1005|1004|1048)$/], //1008 extentions can listen to 1008|1006|1003|1004|1024|1023 extensions
	// [/^1008$/, /^Ext\.(1008|1006|1003|1004|1024|1023)$/], //1008 extentions can listen to 1008|1006|1003|1004|1024|1023 extensions
	// [/^1006$/, /^Ext\.1006$/], //1006 extentions can listen to 1006 extensions
	// [/^1006$/, /^Ext\.1006$/], //1006 extentions can listen to 1006 extensions
	// [/^1003$/, /^Ext\.1003$/], //1003 extentions can listen to 1003 extensions
	// [/^1004$/, /^Ext\.1004$/], //1004 extentions can listen to 1004 extensions
	// [/^1024$/, /^Ext\.1024$/], //1024 extentions can listen to 1024 extensions
	// [/^1023$/, /^Ext\.1023$/], //1023 extentions can listen to 1023 extensions
	// [/^1001$/, /^Ext\.(1001|1002|1005|1004|1048)$/], //0xxx extentions can listen to any 4 digit extensions
	// [/^1002$/, /^Ext\.1002$/], //1002 extentions can listen to 1002 extensions
	// [/^1005$/, /^Ext\.1005$/], //1005 extentions can listen to 1005 extensions
	// [/^1004$/, /^Ext\.1004$/], //1004 extentions can listen to 1004 extensions
	// [/^1048$/, /^Ext\.1048$/], //0xxx extentions can listen to 1048 extensions
	// [/^1000$/, /^Ext\.\d{4}$/], //0xxx extentions can listen to any 4 digit extensions
	[/^7003$/, /^Ext\.\d{4}$/], //0xxx extentions can listen to any 4 digit extensions
	[/^7004$/, /^Ext\.\d{4}$/], //0xxx extentions can listen to any 4 digit extensions
	[/^\d{3,4}$/, /^Ext\.\d{4}$/], //0xxx extentions can listen to any 4 digit extensions
];
