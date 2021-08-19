const axios = require('axios').default
const { parse } = require('node-html-parser')

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
        this.url = url
    }

    async toNotionBlockJSON() {
        if (this.url) {
            try {
                const response = await axios.get(this.url)
                const html = parse(response.data)
                this.originalTitle = html.querySelector('head > title').text
            }
            catch (error) {
                console.log('err', error)
            }
        }
        const result = {
            'Title Thân Thiện': {
                title: [
                    {
                        text: {
                            content: this.title,
                        },
                    },
                ],
            },
            'Title Gốc': {
                rich_text: [
                    {
                        text: {
                            content: this.originalTitle,
                        },
                    },
                ],
            },
            'Comment - Review': {
                rich_text: [
                    {
                        text: {
                            content: this.content,
                        },
                    },
                ],
            },
            'Discord Contributor': {
                rich_text: [
                    {
                        text: {
                            content: this.contributor,
                        },
                    },
                ],
            },
            Tags: {
                'relation': this.tags.map(tag => ({ id: tag.id })),
            },
            'Chat URL': {
                url: this.chat_url,
            },
            Link: {
                url: this.url || this.chat_url,
            },
        }
        return result
    }
}

module.exports = Link