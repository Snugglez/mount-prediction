const 	Command = require('command'),
		config = require('./config.json'),
		GameState = require('tera-game-state'),
		path = require('path'),
		fs = require('fs')
module.exports = function mountpredict(d) {
const 	c = Command(d),
		g = GameState(d),
		mounts = require('./mountlist.json'),
		grounds = require('./groundlist.json')

let enabled = config.enabled,
	onMount = null,
	incontract = null,
	skilldb = null

//commands o' plenty
c.add("mp", (option, value) => {
switch (option) {
case "on":
enabled = true
c.message(` [${enabled ? 'enabled' : 'disabled'}]`)
break;
case "off":
enabled = false
c.message(` [${enabled ? 'enabled' : 'disabled'}]`)
break;
case "unmount":
c.message(` [unmounted]`)
d.send('S_UNMOUNT_VEHICLE', 2, {
gameId: g.me.gameId,
skill: skilldb
})
d.send('S_SHORTCUT_CHANGE', 1, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
d.send('C_UNMOUNT_VEHICLE', 1, {
})
break;
}})

//cStartSkill hook instant mount function
d.hook('C_START_SKILL', (d.base.majorPatchVersion >= 74) ? 7 : 6, (e) => {
if (!enabled || g.me.inCombat || incontract || !mounts[e.skill.id]) return
skilldb = e.skill.id
d.send('S_MOUNT_VEHICLE', 2, {
gameId: g.me.gameId,
id: mounts[skilldb],
skill: skilldb,
unk: false
})
if (grounds.includes(mounts[skilldb])) {
d.hookOnce('S_SHORTCUT_CHANGE', 1, (e) => {
return false
})
}
})

//cStartSkill hook instant unmount function
d.hook('C_START_SKILL', (d.base.majorPatchVersion >= 74) ? 7 : 6, (e) => {
if(!enabled || !onMount || incontract) return;
else if(mounts[e.skill.id] || e.skill.id === 65000001){

d.send('S_UNMOUNT_VEHICLE', 2, {
gameId: g.me.gameId,
skill: skilldb
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

//fix for teleporting while on a flying mount
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

//shit fix if the client is stuck incontract
d.hook('S_MOUNT_VEHICLE', 2, (e) => {
if(!enabled) return;
if(g.me.is(e.gameId))
incontract = false
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
	d.hook('S_REQUEST_CONTRACT', 1, e => { incontract = true })
	d.hook('S_ACCEPT_CONTRACT', 1, e => { incontract = false })
	d.hook('S_REJECT_CONTRACT', 1, e => { incontract = false })
	d.hook('S_CANCEL_CONTRACT', 1, e => { incontract = false })
	d.hook('S_GACHA_END', 1, e => { incontract = false })
	d.hook('S_LOAD_TOPO', 3, e => { incontract = false })
	d.hook('C_BIND_ITEM_EXECUTE', 1, e => { incontract = false })
}