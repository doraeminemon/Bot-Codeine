const { Client } = require('@notionhq/client')

const NOTION_KEY = process.env.NOTION_KEY
const database_id = process.env.NOTION_REPO_DB_ID

const notion = new Client({ auth: NOTION_KEY })

/**
 * Link
 * @param {import('../notion/lib/Link')} link
 */
async function addItem(link) {
    try {
        await notion.pages.create({
            parent: { database_id },
            properties: link.toNotionBlockJSON(),
        })
        console.log('Success, entry added')
    }
    catch (error) {
        console.log('error', error.body)
    }
}

async function findItem(url) {
    try {
        return notion.databases.query({
            database_id,
            filter: {
                property: 'URL',
                text: {
                    equals: url,
                },
            },
        })
    }
    catch (error) {
        console.log('error', error.body)
    }
}

module.exports = {
    addItem,
    findItem,
}