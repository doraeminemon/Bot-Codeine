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
    }

    toNotionBlockJSON() {
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
            Contributor: {
                'rich_text': [
                    {
                        'text': {
                            'content': this.contributor,
                        },
                    },
                ],
            },
            Tags: {
                'multi_select': this.tags.map(tag => ({ name: tag })),
            },
            'Chat URL': {
                url: this.chat_url,
            },
        }
        if (this.url) {
            result.URL = {
                url: this.url,
            }
        }
        return result
    }
}

module.exports = Link