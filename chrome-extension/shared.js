function shared() {
    return {
        showColorBar: true,
        showMessage: true,
        domainChangeWarning: true,
        colorBarPositions: {
            top: true,
            bottom: false,
            left: false,
            right: false
        },
        messagePosition: {
            top: false,
            bottom: true,
            left: false,
            right: true,
            rotated: false
        },
        colorOrder: [
            'prod',
            'acc',
            'test',
            'dev'
        ],
        colorSettings: {
            prod: {
                color: '#FFFF00',
                message: 'Production environment',
                siteMatches: []
            },
            acc: {
                color: '#FF0000',
                message: 'Acceptance environment',
                siteMatches: [
                    '^acc\\..*$'
                ]
            },
            test: {
                color: '#0000FF',
                message: 'Test environment',
                siteMatches: [
                    '^test\\..*$'
                ]
            },
            dev: {
                color: '#00FF00',
                message: 'Local environment',
                siteMatches: [
                    '^.*\\.dev$',
                    '^.*\\.local$',
                    '^.*\\.localhost$'
                ]
            }
        },
        sites: {
            none: [],
            prod: [],
            acc: [],
            test: [],
            dev: []
        }
    };
}

function siteMatchRegExp(siteMatch) {
    // siteMatch = siteMatch.replace(/\./g, '\\\.');
    // siteMatch = siteMatch.replace(/\*/g, '[^.]*');
    return new RegExp(siteMatch, 'i');
}