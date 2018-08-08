const 	Command = require('command'),
		config = require('./config.json'),
		GameState = require('tera-game-state'),
		path = require('path'),
		fs = require('fs')
module.exports = function mountpredict(d) {
const 	c = Command(d),
		g = GameState(d);

let enabled = config.enabled,
	sudo = config.sudo,
	onMount = null,
	customMount = 0,
	incontract = null,
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
d.send('S_UNMOUNT_VEHICLE', 2, {
gameId: g.me.gameId,
skill: 12200016
})
d.send('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
d.send('C_UNMOUNT_VEHICLE', 1, {
})
break;
case "sudo":
sudo = !sudo
c.message(`sudo is now ${sudo ? 'enabled' : 'disabled'}.`)
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

//cStartSkill hook instant mount function for flying mounts
d.hook('C_START_SKILL', (d.base.majorPatchVersion >= 74) ? 7 : 6, (e) => {
if(!enabled || g.me.inCombat || incontract || !mounts.includes(e.skill.id) || customMount < 1 || customMount > 293 || grounds.includes(customMount)) return
d.send('S_MOUNT_VEHICLE', 2, {
gameId: g.me.gameId,
id: customMount,
skill: 12200016,
unk: false
}),
d.send('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: true
})
})

//cStartSkill hook instant mount function for ground mounts
d.hook('C_START_SKILL', (d.base.majorPatchVersion >= 74) ? 7 : 6, (e) => {
if(!enabled || g.me.inCombat || incontract || !mounts.includes(e.skill.id) || customMount < 1 || customMount > 293 || !grounds.includes(customMount)) return
d.send('S_MOUNT_VEHICLE', 2, {
gameId: g.me.gameId,
id: customMount,
skill: 12200016,
unk: false
}),
d.hookOnce('S_SHORTCUT_CHANGE', 1, (e) => {
return false
})
})

//cStartSkill hook instant unmount function
d.hook('C_START_SKILL', (d.base.majorPatchVersion >= 74) ? 7 : 6, (e) => {
if(!enabled || !onMount || incontract || e.skill.id === 65000002 || e.skill.id === 65000001) return;
else if(mounts.includes(e.skill.id)){

d.send('S_UNMOUNT_VEHICLE', 2, {
gameId: g.me.gameId,
skill: 12200016
})

d.send('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
}
})

//cStartSkill hook for flying mount dismount
d.hook('C_START_SKILL', (d.base.majorPatchVersion >= 74) ? 7 : 6, (e) => {
if(!enabled || !onMount || e.skill.id === 65000002) return;
else if(e.skill.id === 65000001){
d.send('C_UNMOUNT_VEHICLE', 1, {
})
d.send('S_UNMOUNT_VEHICLE', 2, {
gameId: g.me.gameId,
skill: 12200016
})
d.send('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
}
})

//instant C...
d.hook('C_START_SKILL', (d.base.majorPatchVersion >= 74) ? 7 : 6, (e) => {
if(!enabled) return
else if(e.skill.id === 65000002){
d.send('S_START_CLIENT_CUSTOM_SKILL', (d.base.majorPatchVersion >= 74) ? 2 : 2, {
skill: 65000002
})
d.hookOnce('S_START_CLIENT_CUSTOM_SKILL', (d.base.majorPatchVersion >= 74) ? 2 : 2, (e) => {return false})
}
})

//fix for teleporting while on a flying mount (im retarded and forgot a gameId check...)
d.hook('S_UNMOUNT_VEHICLE', 2, (e) => {
if(!enabled) return
else if(g.me.is(e.gameId)){
d.send('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
}
})

d.hook('S_MOUNT_VEHICLE', 2, (e) => {
if(!enabled) return;
if(g.me.is(e.gameId))
incontract = false
if(sudo && g.me.is(e.gameId)){
customMount = e.id}
})

//sSystemMessage to instantly unmount in unmountable zones
d.hook('S_SYSTEM_MESSAGE', 1, (e) => {
if(e.message.includes('@1007') || e.message.includes('@36') || e.message.includes('@3880'))
d.send('S_UNMOUNT_VEHICLE', 2, {
gameId: g.me.gameId,
skill: 12200016
})
})

//temp hooks that will be replaced with game state once im not retarded
	d.hook('S_MOUNT_VEHICLE', 2, e => { if(g.me.is(e.gameId)) onMount = true })
	d.hook('S_UNMOUNT_VEHICLE', 2, e => { if(g.me.is(e.gameId)) onMount = false })
	d.hook('S_REQUEST_CONTRACT', 1, event => { incontract = true })
	d.hook('S_ACCEPT_CONTRACT', 1, event => { incontract = false })
	d.hook('S_REJECT_CONTRACT', 1, event => { incontract = false })
	d.hook('S_CANCEL_CONTRACT', 1, event => { incontract = false })
    //setInterval(() => { console.log('stuff: ' + stuff); }, 1000); //(seems like a nice place to keep it ¯\_(ツ)_/¯)

}