const shared = require('./shared');
const parseBody = require('co-body');

const coalesce = (total, value) => total > 0 ? (value / total).toFixed(2) : '0.00';

module.exports = async (req, res) => {
    try {
        shared.cors.setStandardHeaders(res);
        if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.setHeader('Content-Length', '0');
            return res.end();
        } else if (req.method === 'POST') {
            if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
                res.statusCode = 401;
                return res.end('Unauthorized');
            }
            const apiKey = req.headers.authorization.split(' ')[1];
            if (process.env.PIGGY_API_KEY !== apiKey) {
                res.statusCode = 401;
                return res.end('Unauthorized');
            }

            const requestBody = await parseBody.json(req);
            const device = await shared.device.getById(requestBody.coreid);


            const toggles = device.goals.map(g => g.enabled);
            const toggleString = toggles.map(t => t ? 1 : 0).join('|');
            const colors = device.goals.map(g => g.color);
            const colorString = colors.join('|');
            const values = device.goals.map(g => {
                return {
                    total: g.total,
                    current: g.current,
                    promise: g.promise
                };
            });
            const valueString = values.map(v => `${coalesce(v.total, v.current)},${coalesce(v.total, v.promise)}`).join('|');

            let piggySleepString = '0|00:00|00:00|0|0';
            if (device.piggySleep) {
                piggySleepString = `${device.piggySleep.enabled ? 1 : 0}|${device.piggySleep.wakeupTime || '00:00'}|${device.piggySleep.sleepTime || '00:00'}|${device.piggySleep.timezone || 0}|${device.piggySleep.observeDaylightSavings ? 1 : 0}`
            }



            return res.end(JSON.stringify({
                toggleString,
                colorString,
                valueString,
                piggySleepString
            }));
        }
    } catch (err) {
        console.error(err);
        res.statusCode = 500;
        return res.end('Unexpected Error');
    }
};
