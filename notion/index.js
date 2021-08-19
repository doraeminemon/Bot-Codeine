const { Client } = require('@notionhq/client')

const NOTION_KEY = process.env.NOTION_KEY
const database_id = process.env.NOTION_REPO_DB_ID
const tagDBID = '79622c07d2ed41f0b5b2bc531a6c60ae'

const notion = new Client({ auth: NOTION_KEY })

/**
 * Link
 * @param {import('../notion/lib/Link')} link
 */
async function addItem(link) {
    try {
        const resp = await notion.pages.create({
            parent: { database_id },
            properties: await link.toNotionBlockJSON(),
        })
        console.log('addItem: ', resp)
        return resp
    }
    catch (error) {
        console.log('addItem error', error.body)
    }
}

/**
 * @param {string} url
 *
 * Check uniqueness of chat url to prevent duplicate entries
 */
async function findItemByChatURL(url) {
    try {
        return notion.databases.query({
            database_id,
            filter: {
                property: 'Chat URL',
                text: {
                    equals: url,
                },
            },
        })
    }
    catch (error) {
        console.log('findItemByChatURL error', error)
        console.log('findItemByChatURL error body', error.body)
    }
}

/**
 * @typedef {{ id: string, name: string, originalName: string}} Tag
 * @returns {Tag[]}
 *
 * Gettings all tags in the form of id / name
*/
async function getTags() {
    try {
        const response = await notion.databases.query({ database_id: tagDBID })
        const mapping = response.results.map((item) => ({
            id: item.id,
            name: item.properties.Name.title[0].text.content.toLowerCase(),
            originalName: item.properties.Name.title[0].text.content,
        }))
        return mapping
    }
    catch (error) {
        console.log('getTags error', error)
    }
}

module.exports = {
    addItem,
    findItemByChatURL,
    getTags,
}