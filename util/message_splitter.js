module.exports = function splitMessage(text) {
    const message_list = [];
    if (text.length > 2000) {
        const splitMessages = text.split(/\n *\n/)
        let msg = splitMessages[0]
        for (let idx = 1; idx < splitMessages.length; idx++) {
            let s = splitMessages[idx]
            let tmp = `${msg}\n\n${s}`
            if (tmp.length >= 2000) {
                message_list.push(msg)
                msg = s
            } else {
                msg = tmp
            }
        }
        message_list.push(msg)
    } else {
        message_list.push(text)
    }
    return message_list
}