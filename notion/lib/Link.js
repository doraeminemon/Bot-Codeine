class Link {
    constructor({
        title,
        content,
        contributor,
        url,
        attachments,
        tags,
    }) {
        this.title = title
        this.content = content
        this.url = url
        this.contributor = contributor
        this.attachments = attachments
        this.tags = tags || []
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
                'text': [
                    {
                        'text': {
                            content: this.content,
                        },
                    },
                ],
            },
            Contributor: {
                'rich_text': [
                    {
                        'plain_text': this.contributor,
                    },
                ],
            },
            Tags: {
                'multi_select': this.tags.map(tag => ({ name: tag })),
            },
            URL: {
                url: this.url,
            },
        }
    }
}

module.exports = Link