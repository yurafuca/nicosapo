import store from "store";
import AutoEnterProgram from "../autoEnter/AutoEnterProgram";
import AutoEnterCommunity from "../autoEnter/AutoEnterCommunity";

const _funcs = {
  live: AutoEnterProgram,
  community: AutoEnterCommunity,
  channel: AutoEnterCommunity
};

const _keys = {
  live: "autoEnterProgramList",
  community: "autoEnterCommunityList",
  channel: "autoEnterCommunityList"
};

const INTERVAL = 6 * 1000;

export default class AutoEnterRunner {
  run(requestType) {
    new Promise(resolve => {
      let storagedData = {};
      if (store.get(_keys[requestType])) {
        storagedData = store.get(_keys[requestType]);
      }
      const funcs = [];
      for (const id in storagedData) {
        const func = new _funcs[requestType]();
        funcs.push(func.exec.bind(null, id));
      }
      const length = funcs.length;
      if (funcs.length === 0) {
        resolve();
      }
      for (let i = 0; i < funcs.length; i++) {
        (() => {
          setTimeout(() => {
            funcs[i].call(null);
            console.info("Checking... %d/%d", i + 1, length);
            if (i === length - 1) {
              setTimeout(resolve, INTERVAL);
            }
          }, i * INTERVAL); // 連続アクセスを防ぐ
        })(i, length);
      }
    });
  }
}
