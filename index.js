const Command = require('command'),
		path = require('path'),
		fs = require('fs')
module.exports = function mountpredict(dispatch) {
const c = Command(dispatch)

let enabled = true,
	cid = null,
	inCombat = null,
	onMount = null,
	customMount = 0,
	mounts = require('./mountlist.json'),
	grounds = require('./groundlist.json')

//commands o' plenty
c.add("mp", (option, value) => {
switch (option) {
case "on":
enabled = true
c.message(`mount prediction is now ${enabled ? 'enabled' : 'disabled'}.`)
break;
case "off":
enabled = false
c.message(`mount prediction is now ${enabled ? 'enabled' : 'disabled'}.`)
break;
case "set":
customMount = parseInt(value);
for (i = 0; i < INVALID.length; i++) {
if(INVALID[i] == customMount){
c.message('The value: '+customMount+' is invalid, try another.');
customMount = 0;}}
c.message('Mount set to: '+value+'.');
saveMount()
break;
case "unmount":
c.message(`Kill Switch Used`)
dispatch.toClient('S_UNMOUNT_VEHICLE', 2, {
gameId: cid,
skill: 12200016
})
dispatch.toClient('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
dispatch.toServer('C_UNMOUNT_VEHICLE', 1, {
})
break;
}})
	
//custom mount copy/paste fiesta 
const INVALID = [
4,100,105,106,107,108,109,110,111,112,
113,114,115,116,117,118,119,120,121,122,
123,124,125,126,127,128,129,130,131,132,
133,134,135,136,137,138,139,140,141,142,
143,144,145,146,147,148,149
];
try {
customMount = require('./mount.json')}
catch(e) {}
function saveMount() {
fs.writeFileSync(path.join(__dirname, 'mount.json'), JSON.stringify(customMount))
}

//hook checklist
dispatch.hook('S_LOGIN', 10, (event) => {cid = event.gameId})
dispatch.hook('S_USER_STATUS', 1, event => { if(event.target.equals(cid)){if(event.status == 1){inCombat = true}else inCombat = false}})
dispatch.hook('S_MOUNT_VEHICLE', 2, event => { if(event.gameId.equals(cid)) onMount = true })
dispatch.hook('S_UNMOUNT_VEHICLE', 2, event => { if(event.gameId.equals(cid)) onMount = false })

//cStartSkill hook instant mount function for flying mounts
dispatch.hook('C_START_SKILL', (dispatch.base.majorPatchVersion >= 74) ? 7 : 6, (event) => {
if(!enabled || inCombat || !mounts.includes(event.skill.id) || customMount < 1 || customMount > 275 || grounds.includes(customMount)) return
dispatch.toClient('S_MOUNT_VEHICLE', 2, {
gameId: cid,
id: customMount,
skill: 12200016,
unk: false
})
dispatch.toClient('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: true
})
})

//cStartSkill hook instant mount function for ground mounts
dispatch.hook('C_START_SKILL', (dispatch.base.majorPatchVersion >= 74) ? 7 : 6, (event) => {
if(!enabled || inCombat || !mounts.includes(event.skill.id) || customMount < 1 || customMount > 275 || !grounds.includes(customMount)) return
dispatch.toClient('S_MOUNT_VEHICLE', 2, {
gameId: cid,
id: customMount,
skill: 12200016,
unk: false
})
dispatch.hookOnce('S_SHORTCUT_CHANGE', 1, (event) => {
event.enable = false
return true
})
})

//cStartSkill hook instant unmount function
dispatch.hook('C_START_SKILL', (dispatch.base.majorPatchVersion >= 74) ? 7 : 6, (event) => {
if(!enabled || !onMount || event.skill.id === 65000002 || event.skill.id === 65000001) return;
else if(mounts.includes(event.skill.id)){

dispatch.toClient('S_UNMOUNT_VEHICLE', 2, {
gameId: cid,
skill: 12200016
})

dispatch.toClient('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
}
})

//cStartSkill hook for flying mount dismount
dispatch.hook('C_START_SKILL', (dispatch.base.majorPatchVersion >= 74) ? 7 : 6, (event) => {
if(!enabled || !onMount || event.skill.id === 65000002) return;
else if(event.skill.id === 65000001){
dispatch.toServer('C_UNMOUNT_VEHICLE', 1, {
})
dispatch.toClient('S_UNMOUNT_VEHICLE', 2, {
gameId: cid,
skill: 12200016
})
dispatch.toClient('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
}
})

//instant C...
dispatch.hook('C_START_SKILL', (dispatch.base.majorPatchVersion >= 74) ? 7 : 6, (event) => {
if(!enabled) return
else if(event.skill.id === 65000002){
dispatch.toClient('S_START_CLIENT_CUSTOM_SKILL', (dispatch.base.majorPatchVersion >= 74) ? 3 : 2, {
skill: 65000002
})
dispatch.hookOnce('S_START_CLIENT_CUSTOM_SKILL', (dispatch.base.majorPatchVersion >= 74) ? 3 : 2, (event) => {return false})
}
})

//fix for teleporting while on a flying mount (im retarded and forgot a gameId check...)
dispatch.hook('S_UNMOUNT_VEHICLE', 2, (event) => {
if(!enabled) return
else if(event.gameId.equals(cid)){
dispatch.toClient('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
}
})

//sSystemMessage to instantly unmount in unmountable zones
dispatch.hook('S_SYSTEM_MESSAGE', 1, (event) => {
if(event.message.includes('@1007') || event.message.includes('@36') || event.message.includes('@3880'))
dispatch.toClient('S_UNMOUNT_VEHICLE', 2, {
gameId: cid,
skill: 12200016
})
})
}