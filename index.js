const	config = require('./config.json'),
		path = require('path'),
		fs = require('fs')
module.exports = function mountpredict(d) {

let enabled = config.enabled,
	onMount = null,
	incontract = null,
	mountId = null,
	mountSkill = null

//commands o' plenty
d.command.add("mp", {
on() {
enabled = true
d.command.message(`[enabled]`)
},
off() {
enabled = false
d.command.message(`[disabled]`)
},
unmount() {
d.command.message(`[unmounted]`)
d.send('S_UNMOUNT_VEHICLE', 2, {
gameId: d.game.me.gameId,
skill: mountSkill
})
d.send('S_SHORTCUT_CHANGE', 2, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
d.send('C_UNMOUNT_VEHICLE', 1, {
})
},
$default() {
d.command.message("Command list")
d.command.message(" ")
d.command.message("mp on/off")
d.command.message("--Toggles mount prediction on or off")
d.command.message(" ")
d.command.message("mp unmount")
d.command.message("--Dismounts you incase something bugs out and you can't")
}
})

//cStartSkill hook instant mount function
d.hook('C_START_SKILL', 7, (e) => {
if(!enabled || d.game.me.inCombat || incontract) return
if(e.skill.id == mountSkill && !onMount) {
d.send('S_MOUNT_VEHICLE', 2, {
gameId: d.game.me.gameId,
id: mountId,
skill: mountSkill,
unk: false
})
}
else if(e.skill.id == mountSkill && onMount || e.skill.id == 65000001) {
d.send('S_UNMOUNT_VEHICLE', 2, {
gameId: d.game.me.gameId,
skill: mountSkill
})
d.send('S_SHORTCUT_CHANGE', 2, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
}
else if(e.skill.id == 65000002){
d.send('S_START_CLIENT_CUSTOM_SKILL', 4, {
gameId: d.game.me.gameId,
skill: 65000002
})
d.hookOnce('S_START_CLIENT_CUSTOM_SKILL', 4, (e) => {return false})
}
})

//fix for teleporting while on a flying mount
d.hook('S_UNMOUNT_VEHICLE', 2, (e) => {
if(!enabled) return
else if(d.game.me.is(e.gameId)){
d.send('S_SHORTCUT_CHANGE', 2, {
huntingZoneId: 7031,
id: 300001,
enable: false
})
}
})

//shit fix if the client is stuck incontract
d.hook('S_MOUNT_VEHICLE', 2, (e) => {
if(!enabled) return;
if(d.game.me.is(e.gameId)){
mountId = e.id
mountSkill = e.skill
incontract = false
}
})

//sSystemMessage to instantly unmount in unmountable zones
d.hook('S_SYSTEM_MESSAGE', 1, (e) => {
if(e.message.includes('@1007') || e.message.includes('@36') || e.message.includes('@3880') || e.message.includes('@3878'))
d.send('S_UNMOUNT_VEHICLE', 2, {
gameId: d.game.me.gameId,
skill: 12200016
})
})

//temp hooks that will be replaced with game state once im not retarded
	d.hook('S_MOUNT_VEHICLE', 2, e => { if(d.game.me.is(e.gameId)) onMount = true })
	d.hook('S_UNMOUNT_VEHICLE', 2, e => { if(d.game.me.is(e.gameId)) onMount = false })
	d.hook('S_REQUEST_CONTRACT', 1, e => { incontract = true })
	d.hook('S_ACCEPT_CONTRACT', 1, e => { incontract = false })
	d.hook('S_REJECT_CONTRACT', 1, e => { incontract = false })
	d.hook('S_CANCEL_CONTRACT', 1, e => { incontract = false })
	d.hook('S_GACHA_END', 1, e => { incontract = false })
	d.hook('C_BIND_ITEM_EXECUTE', 1, e => { incontract = false })
}