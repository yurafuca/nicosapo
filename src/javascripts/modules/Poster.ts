import { Manageable, Program } from "./Manageable";
import { ProgramBuilder } from "./ManageableBuilder";
import { Bell } from "./Bell";

export class Poster {
    private _hasLaunched: boolean;
    private readonly _title: string;
    private readonly _thumbnailUrl: string;
    private readonly _id: string;
    private _duration: number;
    private _notification: Notification | null;
    private _bell: Bell | null;

    constructor(title: string, thumbnailUrl: string, id: string) {
        this._title = title;
        this._thumbnailUrl = thumbnailUrl;
        this._id = id;
        this._duration = 6;
    }

    bell(bell: Bell) {
        this._bell = bell;
        return this;
    }

    duration(second: number) {
        this._duration = second;
        return this;
    }

    launch() {
        const title = this._title;
        const thumbnailUrl = this._thumbnailUrl;
        const id = this._id;
        const options = new class implements NotificationOptions {
            body = title;
            icon = thumbnailUrl;
        };
        this._notification = new Notification("放送開始のおしらせ", options);
        this._notification.onclick = () => {
            chrome.tabs.create({
                url: `https://live.nicovideo.jp/watch/${id}`,
                active: true
            });
        };
        this._hasLaunched = true;
        if (this._bell) {
            this._bell.ring();
        }
        setTimeout(() => {
            this.close();
        }, this._duration * 1000);
    }

    private close() {
        if (this._notification) {
            this._notification.close();
        }
    }
}
