import { Manageable, Program } from "./Manageable";
import { ProgramBuilder } from "./CheckableBuilder";

// new Letter().setup(bundled).bell(bell).launch()

export class Letter {
    params: LetterParams;
    notification: Notification;
    setup(bundled: Program): Letter {
        this.params = LetterParams.create(bundled);
        return this;
    }
    launch() {
        const title = this.params.title;
        const thumbnailUrl = this.params.thumbnailUrl;
        const options = new class implements NotificationOptions {
            body = title;
            icon = thumbnailUrl;
        };
        this.notification = new Notification(this.params.title, options);
        this.notification.onclick = this.createTab;
    }
    close() {
        this.notification.close();
    }
    private createTab() {
        chrome.tabs.create({
            url: `https://live.nicovideo.jp/watch/${this.params.id}`,
            active: true
        });
    }
}

export class LetterParams {
    title: string;
    thumbnailUrl: string;
    id: string;
    constructor(title: string, thumbnailUrl: string, id: string) {
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
        this.id = id;
    }
    static create(bundled: Program): LetterParams {
        return new LetterParams(
            bundled.title,
            bundled.community.thumbnailUrl,
            bundled.id
        );
    }
}

