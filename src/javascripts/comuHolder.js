export default class ComuHolder
{
    constructor(initial = null) {
        this.source = initial;
    }

    setSource(videoInfos) {
        this.source = videoInfos;
    }

    isNew(info) {
        if (this.source == null) {
            // dont show notification.
            return false;
        }
        // alert("hoge");
        console.info('[ComuHolder]', $(info));
        console.info('[ComuHolder]', $(info).find('community id'));
        let id = $(info).find('community id').text();
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
