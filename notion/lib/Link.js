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
        this.url = url
        this.contributor = contributor
        this.attachments = attachments
        this.tags = tags || []
        this.chat_url = chat_url
    }

    toNotionBlockJSON() {
        return {
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
            URL: {
                url: this.url,
            },
            'Chat URL': {
                url: this.chat_url,
            },
        }
    }
}

module.exports = Link