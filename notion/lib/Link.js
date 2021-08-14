const cheerio = require('cheerio')
const { request } = require('express')

const TagMapper = {}
class Link {
    constructor({
        title,
        content,
        contributor,
        url,
        attachments,
        tags,
        chat_url,
    }) {
        this.title = title
        this.content = content
        this.contributor = contributor
        this.attachments = attachments
        this.tags = tags || []
        this.chat_url = chat_url
        // optional field
        this.url = url
        // tags
    }

    getTagRelation(tag) {
        const relationId = TagMapper[tag]
        if (relationId) {
            return {
                id: relationId,
            }
        }
        return undefined
    }

    async toNotionBlockJSON() {
        if (this.url) {
            this.title = await request(this.url, (err, res, body) => {
                if (err) {
                    console.log(err)
                    return
                }
                const $ = cheerio.load(body)
                return $('head > title').text()
            })
        }
        const result = {
            Title: {
                title: [
                    {
                        'text': {
                            'content': this.title,
                        },
                    },
                ],
            },
            Content: {
                'rich_text': [
                    {
                        'text': {
                            'content': this.content,
                        },
                    },
                ],
            },
            'Discord Contributor': {
                'rich_text': [
                    {
                        'text': {
                            'content': this.contributor,
                        },
                    },
                ],
            },
            Tags: {
                'relation': this.tags.map(this.getTagRelation).filter(Boolean),
            },
            'Chat URL': {
                url: this.chat_url,
            },
            URL: {
                url: this.url || this.chat_url,
            },
        }
        return result
    }
}

module.exports = Link