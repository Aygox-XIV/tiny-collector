/**
 * Extracts a name -> relative url map from the HTML if the list of items on https://tiny-shop.fandom.com/wiki/Items.
 * The url will be valid for ImageRef.fandom_wiki_image_path values.
 */
export function importItemIconUrls(htmlData: string): Record<string, string> {
    let itemIconUrls: Record<string, string> = {};
    htmlData = htmlData.replaceAll('\n', '').replaceAll('\r', '');

    // Parsing _arbitrary_ HTML with regexes is going to be a bad time, but a known format should be OK.
    // for each item:
    // <tr style="">
    // <td><span typeof="mw:File"><span><img alt="$ITEM_NAME_SOMETIMES" src="$ICON_URL_TOMETIMES" [...]></span></span>
    // </td>
    // <td style="text-align:left"><a href="/wiki/$WIKI_PAGE_PATH" title="$ITEM_NAME">$ITEM_NAME</a>
    // </td>
    // [...]
    // However only the items have a <span> directly in front of their <img>, so just use that.
    // similarly, the item name cell format is unique.
    // [^>]+ seems to not work well, so just rely on the two parts to line up.
    const fullUrlRegex = '<tr style=""><td><span[^>]*><span><img alt="([^"]+)" [^>]* data-src="([^"]+)"';
    const urlMatches = [...htmlData.matchAll(RegExp(fullUrlRegex, 'g'))];
    const wikiImagePrefix = 'https://static.wikia.nocookie.net/tiny-shop/images/';

    let urls: string[] = [];

    urlMatches.forEach((match) => {
        const name = match[1];
        const url = match[2];
        if (!url.startsWith(wikiImagePrefix)) {
            console.log('unexpected url: ' + url + ' for ' + name);
            return;
        }
        const pathSuffix = url.match(wikiImagePrefix + '(.*\.png)')!![1];
        urls.push(pathSuffix);
    });

    const itemNameRegex = '<td style="text-align:left"><a href="/wiki/([^"]+)" [^>]+>([^<]*)</a></td><td>';
    const nameMatches = [...htmlData.matchAll(RegExp(itemNameRegex, 'g'))];

    if (nameMatches.length != urlMatches.length) {
        throw 'mismatched matches. ' + nameMatches.length + ' names vs ' + urlMatches.length + ' urls.';
    }

    for (let i = 0; i < nameMatches.length; i++) {
        itemIconUrls[nameMatches[i][2]] = urls[i];
    }

    return itemIconUrls;
}
