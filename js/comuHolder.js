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
            return false;
        }
        // alert("hoge");
        let id = $(community).find('id').text();
        let inarray = $.inArray(parseInt(id), this.source);
        // console.log(this.toBool(1));
        // console.log(this.toBool(inarray));
        return !this.toBool(inarray);
    }

    toBool(value) {
        if (value == -1) return false;
        return true;
    }
}

