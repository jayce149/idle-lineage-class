/*
 * 99-guaranteed-drop-enhance.js
 * 放置天堂經典版｜100% 掉落 + 100% 強化補丁
 *
 * 用法：
 * 1. 將本檔案放到 /js/99-guaranteed-drop-enhance.js
 * 2. index.html 最後的 </body> 前加入：
 *    <script src="js/99-guaranteed-drop-enhance.js?v=1.0.0"></script>
 *
 * 說明：
 * - 不修改原本的 00~32 JS。
 * - 透過包裝原本的 killMob / doEnhance / doBianAttr，
 *   在它們執行時把 Math.random() 暫時固定為 0。
 * - 因此原本使用 Math.random() 做機率判定的掉落、強化成功率
 *   會通過。
 * - 這是前端單機版補丁；如果某項功能不是用 Math.random()
 *   判定，仍需要直接修改該功能的原始 JS。
 */

(function () {
    'use strict';

    var installed = {
        killMob: false,
        doEnhance: false,
        doBianAttr: false
    };

    function runWith100PercentChance(fn, ctx, args) {
        var oldRandom = Math.random;

        Math.random = function () {
            return 0;
        };

        try {
            return fn.apply(ctx, args || []);
        } finally {
            Math.random = oldRandom;
        }
    }

    function patchFunction(name, flagName) {
        if (installed[flagName]) return true;

        var fn = window[name];

        if (typeof fn !== 'function') {
            return false;
        }

        window[name] = function () {
            return runWith100PercentChance(
                fn,
                this,
                Array.prototype.slice.call(arguments)
            );
        };

        installed[flagName] = true;

        console.log('[99] 已啟用 100%：' + name);
        return true;
    }

    function install() {
        /*
         * killMob：
         * 怪物死亡結算時，原程式的隨機掉落判定會全部通過。
         */
        patchFunction('killMob', 'killMob');

        /*
         * doEnhance：
         * 普通裝備強化成功率固定通過。
         */
        patchFunction('doEnhance', 'doEnhance');

        /*
         * doBianAttr：
         * 碧恩屬性強化成功率固定通過。
         */
        patchFunction('doBianAttr', 'doBianAttr');

        if (
            installed.killMob &&
            installed.doEnhance &&
            installed.doBianAttr
        ) {
            clearInterval(timer);
            console.log('[99] 100% 掉落 / 強化補丁全部載入完成');
        }
    }

    /*
     * 使用輪詢是為了避免前面的遊戲 JS
     * 還沒有完成函式初始化。
     */
    install();

    var timer = setInterval(install, 100);

    /*
     * 最多等待 30 秒，避免頁面一直保留計時器。
     */
    setTimeout(function () {
        clearInterval(timer);

        console.log(
            '[99] 檢查結果：' +
            ' killMob=' + installed.killMob +
            ', doEnhance=' + installed.doEnhance +
            ', doBianAttr=' + installed.doBianAttr
        );
    }, 30000);

})();
