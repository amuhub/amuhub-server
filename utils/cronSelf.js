const axios = require('axios');

const cronSelf = async () => {
    const self_url = process.env.SELF_URL;
    const res = await axios.get(self_url);
}

module.exports = cronSelf;