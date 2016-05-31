class ComuHolder
{
    constructor(initial = null) {
        this.source = initial;
    }

    // TODO: validation.
    setSource(idList) {
        this.source = idList;
    }

    isNew(community) {
        if (this.source == null) {
            // dont show notification.
            return true;
        }
        let id = $(community).find("community id").text();
        let inarray = $.inArray(id, this.souce);
        return !this.toBool(inarray);
    }

    toBool(value) {
        if (value == -1) return false;
        return true;
    }
}

