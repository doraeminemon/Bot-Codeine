const { Client } = require('@notionhq/client')

const NOTION_KEY = process.env.NOTION_KEY
const NOTION_REPO_DB_ID = process.env.NOTION_REPO_DB_ID

const notion = new Client({ auth: NOTION_KEY })

async function addItem(text) {
    try {
        await notion.request({
            path: 'pages',
            method: 'post',
            body: {
                parent: { database_id: NOTION_REPO_DB_ID },
                properties: {
                    title: {
                        title: [
                            {
                                'text': {
                                    'content': text,
                                },
                            },
                        ],
                    },
                },
            },
        })
        console.log('Success, entry added')
    }
    catch (error) {
        console.log('error', error.body)
    }
}

module.exports = {
    addItem,
}