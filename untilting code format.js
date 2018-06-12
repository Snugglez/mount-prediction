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
        mounts = require('./mountlist.json')

    //custom mount copy/paste fiesta 
    const INVALID = [
        4, 100, 105, 106, 107, 108, 109, 110, 111, 112,
        113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
        123, 124, 125, 126, 127, 128, 129, 130, 131, 132,
        133, 134, 135, 136, 137, 138, 139, 140, 141, 142,
        143, 144, 145, 146, 147, 148, 149
    ];
    try {
        customMount = require('./mount.json')
    } catch (e) {}
    c.add('setmount', (mount) => {
        customMount = parseInt(mount);
        for (i = 0; i < INVALID.length; i++) {
            if (INVALID[i] == customMount) {
                c.message('The value: ' + customMount + ' is invalid, try another.');
                customMount = 0;
            }
        }
        c.message('Mount set to: ' + mount + '.');
        saveMount()
    })

    function saveMount() {
        fs.writeFileSync(path.join(__dirname, 'mount.json'), JSON.stringify(customMount))
    }

    //skill id logger
    let msi = false;
    c.add('msi', () => {
        fsi = !fsi
        c.message(`msi is now ${msi ? 'enabled' : 'disabled'}.`);
        dispatch.hook('C_START_SKILL', 4, e => {
            if (!msi) return
            console.log(e.skill + ",")
        });
    });

    //hook checklist
    dispatch.hook('S_LOGIN', 10, (event) => {
        cid = event.gameId
    })
    dispatch.hook('S_USER_STATUS', 1, event => {
        if (event.target.equals(cid)) {
            if (event.status == 1) {
                inCombat = true
            } else inCombat = false
        }
    })
    dispatch.hook('S_MOUNT_VEHICLE', 1, event => {
        if (event.target.equals(cid)) onMount = true
    })
    dispatch.hook('S_UNMOUNT_VEHICLE', 1, event => {
        if (event.target.equals(cid)) onMount = false
    })

    //main toggle command
    c.add('mptoggle', () => {
        enabled = !enabled
        c.message(`mount prediction is now ${enabled ? 'enabled' : 'disabled'}.`)
    })

    //dismount command incase stuck
    c.add('unmount', () => {
        c.message(`Kill Switch Used`)
        dispatch.toClient('S_UNMOUNT_VEHICLE', 2, {
            gameId: cid,
            skill: 12200016
        })
        dispatch.toClient('S_SHORTCUT_CHANGE', 1, {
            unk1: 7031,
            unk2: 300001,
            unk3: 0
        })
    })

    //cStartSkill hook instant mount function
    dispatch.hook('C_START_SKILL', 4, (event) => {
        if (!enabled || inCombat || !mounts.includes(event.skill) || customMount < 1 || customMount > 275) return
        dispatch.toClient('S_MOUNT_VEHICLE', 2, {
            gameId: cid,
            id: customMount,
            skill: 12200016,
            unk: false
        })
    })

    //cStartSkill hook instant unmount function
    dispatch.hook('C_START_SKILL', 4, (event) => {
        if (!enabled || !onMount || event.skill === 132108866) return;
        else if (event.skill === 132108865 || mounts.includes(event.skill)) {
            dispatch.toClient('S_UNMOUNT_VEHICLE', 2, {
                gameId: cid,
                skill: 12200016
            })

            dispatch.toClient('S_SHORTCUT_CHANGE', 1, {
                unk1: 7031,
                unk2: 300001,
                unk3: 0
            })
        }
    })

    //sSystemMessage to instantly unmount in unmountable zones
    dispatch.hook('S_SYSTEM_MESSAGE', 1, (event) => {
        if (event.message.includes('@1007') || event.message.includes('@36'))
            dispatch.toClient('S_UNMOUNT_VEHICLE', 2, {
                gameId: cid,
                skill: 12200016
            })
    })
}