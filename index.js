const config = require('./config.json'),
	path = require('path'),
	fs = require('fs')
module.exports = function mountpredict(d) {

	let enabled = config.enabled,
		onMount = null,
		incontract = null,
		mountId = null,
		mountSkill = null,
		cMount = false,
		mountCheck = null,
		mountCheckTime = null,
		unmountCheck = null,
		unmountCheckTime = null

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
			d.send('C_UNMOUNT_VEHICLE', 1, {})
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

	function fakeMount() {
		cMount = true
		clearTimeout(mountCheckTime)
		d.send('S_MOUNT_VEHICLE', 2, {
			gameId: d.game.me.gameId,
			id: mountId,
			skill: mountSkill,
			unk: false
		})
		mountCheckTime = setTimeout(function () {
			d.send('S_UNMOUNT_VEHICLE', 2, {
				gameId: d.game.me.gameId,
				skill: mountSkill
			})
		}, 2000)
		mountCheck = d.hook('S_MOUNT_VEHICLE', 2, (e) => {
			if (d.game.me.is(e.gameId)) {
				clearTimeout(mountCheckTime)
				d.unhook(mountCheck)
			}
		})
	}
	function fakeUnMount() {
		d.send('C_UNMOUNT_VEHICLE', 1, {})
		cMount = false
		clearTimeout(unmountCheckTime)
		d.send('S_UNMOUNT_VEHICLE', 2, {
			gameId: d.game.me.gameId,
			skill: mountSkill
		})
		d.send('S_SHORTCUT_CHANGE', 2, {
			huntingZoneId: 7031,
			id: 300001,
			enable: false
		})
		unmountCheckTime = setTimeout(function () {
			d.send('S_MOUNT_VEHICLE', 2, {
				gameId: d.game.me.gameId,
				id: mountId,
				skill: mountSkill,
				unk: false
			})
		}, 2000)
		unmountCheck = d.hook('S_UNMOUNT_VEHICLE', 2, (e) => {
			if (d.game.me.is(e.gameId)) {
				clearTimeout(unmountCheckTime)
				d.unhook(unmountCheck)
			}
		})
	}

	//cStartSkill hook instant mount function
	d.hook('C_START_SKILL', 7, (e) => {
		if (!enabled || d.game.me.inCombat || incontract) return
		if (e.skill.id == mountSkill && !onMount) { fakeMount() }
		else if (e.skill.id == mountSkill && onMount || e.skill.id == 65000001) { fakeUnMount(); return false }
		else if (e.skill.id == 65000002) {
			d.send('S_START_CLIENT_CUSTOM_SKILL', 4, {
				gameId: d.game.me.gameId,
				skill: 65000002
			})
			d.hookOnce('S_START_CLIENT_CUSTOM_SKILL', 4, (e) => { return false })
		}
	})
	d.hook('C_USE_PREMIUM_SLOT', 1, (e) => {
		if (!enabled || d.game.me.inCombat || incontract) return
		if (e.id == mountSkill && !onMount) { fakeMount() }
		else if (e.id == mountSkill && onMount) { fakeUnMount(); return false }
	})

	//fix for teleporting while on a flying mount
	d.hook('S_UNMOUNT_VEHICLE', 2, (e) => {
		if (!enabled) return
		if (d.game.me.is(e.gameId)) {
			onMount = false
			d.send('S_SHORTCUT_CHANGE', 2, {
				huntingZoneId: 7031,
				id: 300001,
				enable: false
			})
		}
	})

	//shit fix if the client is stuck incontract
	d.hook('S_MOUNT_VEHICLE', 2, (e) => {
		if (!enabled) return;
		if (d.game.me.is(e.gameId)) {
			mountId = e.id
			mountSkill = e.skill
			incontract = false
			onMount = true
		}
	})

	//sSystemMessage to instantly unmount in unmountable zones
	d.hook('S_SYSTEM_MESSAGE', 1, (e) => {
		if (e.message.includes('@1007') || e.message.includes('@36') || e.message.includes('@3880') || e.message.includes('@3878'))
			d.send('S_UNMOUNT_VEHICLE', 2, {
				gameId: d.game.me.gameId,
				skill: 12200016
			})
	})

	//fix mounted while incombat if you mount and get put into combat before being mounted server side
	d.hook('S_USER_STATUS', 4, (e) => {
		if (d.game.me.is(e.gameId) && e.status == 1 && cMount && enabled) {
			cMount = false
			d.send('C_UNMOUNT_VEHICLE', 1, {})
			d.send('S_UNMOUNT_VEHICLE', 2, {
				gameId: d.game.me.gameId,
				skill: mountSkill
			})
		}
	})

	d.hook('S_REQUEST_CONTRACT', 'event', () => { incontract = true })
	for (let packet of ['C_BIND_ITEM_EXECUTE', 'S_CANCEL_CONTRACT', 'S_REJECT_CONTRACT', 'S_ACCEPT_CONTRACT'])
		d.hook(packet, 'event', () => { incontract = false })

}
