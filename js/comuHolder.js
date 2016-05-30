class ComuHolder
{
    constructor(initial = []) {
        this.source = initial;
    }

    // TODO: validation.
    setSource(idList) {
        // TODO: type error.
        this.source = idList.concat();
    }

    isNew(community) {
        if (this.source == null) {
            // dont show notification.
            return true;
        }
        let id = $(community).find(id).text();
        let inarray = $.inArray(id, this.souce);
        return !inarray;
    }
}
