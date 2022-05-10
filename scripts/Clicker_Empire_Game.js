class Control{
    static displayNone(ele){
        ele.classList.remove("d-block");
        ele.classList.add("d-none");
    }
    static displayBlock(ele){
        ele.classList.remove("d-none");
        ele.classList.add("d-block");
    }
    static updatePageContent(page, content){
        page.innerHTML = "";
        page.append(content);
    }
    //1秒ごとにアカウントとページの情報を更新する関数
    static timeControl(user){
        let interval = setInterval(function(){
            if(user.active){
                user.updateUser();
                Control.updateMainPage(user);

                LineChart.destroyChartList();

                Config.StockChart = LineChart.lineChartList(user);
                if(!Config.SidePage.classList.contains("d-none")){
                    Control.updateSidePage(user);
                }
            }
            //ユーザーがログアウトしたら更新を中断
            else clearInterval(interval);
        }, 1000);
    }
    //mainPageを更新する関数
    static updateMainPage(user){
        //mainPageのstatusSecのHTMLを更新
        document.getElementById("ageStatus").innerHTML = `Age: ${user.age} years old`;
        document.getElementById("cashStatus").innerHTML = `Cach: $${user.cash}`;
        document.getElementById("stockStatus").innerHTML = `Stock: $${user.calcurateStockAsset()}`;
        document.getElementById("totalTimePlayedStatus").innerHTML = `Total: ${user.totalTimePlayed} days`;
    }
    //sidePageを更新する関数
    static updateSidePage(user){
        //sidePageのstockPriceを更新
        if(document.getElementById("stockPrice") != undefined && document.getElementById("stockPrice").innerHTML != ""){
            document.getElementById("stockPrice").innerHTML = `Price: $${user.itemStatus["ETF Stock"]["price"]}/each`;
        }
        //sidePageのjsonConformページを更新
        if(document.getElementById("save") != undefined && document.getElementById("jsonStatusConform") != undefined){
            document.getElementById("jsonAge").innerHTML = `Age: ${user.age}`;
            document.getElementById("jsonCash").innerHTML = `Cash: ${user.cash}`;
            document.getElementById("jsonTotalTimePlayed").innerHTML = `Total time played: ${user.totalTimePlayed} days`;
        }
    }
}
//折れ線グラフのクラス(LineChart)
class LineChart{
    //userオブジェクトを受け取り、折れ線グラフを描画してグラフのリストを返す関数
    static lineChartList(user){
        let list = [];
        for(let itemName in user.itemStatus){
            if(user.itemStatus[itemName]["type"] == "stock"){
                let dataArray = user.itemStatus[itemName]["stockDataArray"];
                let chart = LineChart.drawLineChart(itemName, dataArray);
                list.push(chart);
            }
        }
        return list;
    }
    //折れ線グラフを描画する関数(drawLineChart)
    static drawLineChart(itemName, dataArray){
        let labelsArray = new Array(160).fill("");
        let canvas = document.getElementById(`${itemName} canvas`);
        let chart = new Chart(canvas, {
            // グラフの種類：折れ線グラフを指定
            type: 'line',
            data: {
                // x軸のメモリ(labels)
                labels: labelsArray,
                datasets: [{
                    data: dataArray,
                    borderColor: "rgb(95, 94, 82)",
                    backgroundColor: "#00000000",
                    lineTension:0,
                    pointRadius: 0,
                    borderWidth: 2
                }],
            },
            options: {
                animation: false,
                scales: {
                    x: { 
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: "Price($)"
                        }
                    }   
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        return chart;
    }
    //Config.StockChartにグラフのデータがあれば、destroy()を実行する関数
    static destroyChartList(){
        if(Config.StockChart != null){
            for(let i = 0; i < Config.StockChart.length; i++){
                Config.StockChart[i].destroy();
            }
        }
    }
}
//ユーザー情報を管理するUserクラス
class User{
    // name(String) >> ユーザ名
    // age(String) >> 年齢
    // userAvatorString(String) >> ユーザーのアバターの名前
    // partnerAvatorString(String) >> パートナーのアバターの名前
    // cash(Number) >> 現金
    // totalTimePlayed(Number) >> プレイ時間
    // hambarger(HashMap) >> 焼いたハンバーガーの情報
    // itemStatus(HashMap) >> 所持しているアイテムの情報
    // active(Boolean) >> プレイ中かどうか
    constructor(userName, userAge, userAvatorString, partnerAvatorString){
        this.name = userName;
        this.age = userAge;
        this.userAvatorString = userAvatorString;
        this.partnerAvatorString = partnerAvatorString;
        this.cash = 50000;
        this.totalTimePlayed = 0;
        this.hambarger = User.generateHambargerStatus();
        this.itemStatus = User.generateItemStatus();
        this.active = true;
    }
    //Json.parse()で読み込んだオブジェクト(jsonDecoded)を基に新しくUserオブジェクトを作成する関数
    static remakeUserFromJsonDecoded(jsonDecoded){
        let user = new User(jsonDecoded.name, jsonDecoded.age, jsonDecoded.userAvatorString, jsonDecoded.partnerAvatorString);
        user.cash = jsonDecoded.cash;
        user.totalTimePlayed = jsonDecoded.totalTimePlayed;
        user.hambarger = jsonDecoded.hambarger;
        user.itemStatus = jsonDecoded.itemStatus;
        user.active = jsonDecoded.active;

        return user;
    }
    //ユーザーのハンバーガーの初期ステータスを作成して、メンバ変数.hambargerを初期化する関数
    static generateHambargerStatus(){
        let hashmap = {
            //1click当たりの収入
            "effect" : 25,
            //焼いたハンバーガーの個数の合計
            "total" : 0
        };
        return hashmap;
    }
    //ユーザーの所持アイテムの初期ステータスを作成して、メンバ変数.itemStatusを初期化する関数
    static generateItemStatus(){
        let items = {};
        for(let i = 0; i < Image.Items.length; i++){
            let curr = Image.Items[i];
            let name = curr["name"];
            items[name] = {
                //タイプ(ability, stock, bonds, real Estate)
                "type" : curr["type"],
                "url" : curr["url"],
                //所持数
                "possession" : 0,
                "price" : curr["price"],
                //効果
                "effect" : curr["effect"],
                //効果の単位($, %)
                "effectUnit" : curr["effectUnit"],
                //最大購入数
                "maxPurchase" : curr["maxPurchase"]
            };
            //stockの場合、150日以内の価格データのリストを格納する"stockDataArray"を作成する
            if(curr["type"] == "stock"){
                items[name]["stockDataArray"] = [curr["price"]];
            }
        }
        return items;
    }
    //アカウント情報を1秒後のものに更新する関数(updateUser)
    updateUser(){
        //プレイ時間を更新
        this.totalTimePlayed += 1;
        //年齢を更新
        if(this.totalTimePlayed % 365 == 0){
            this.age += 1;
        }
        //stockのpriceとdataArrayを更新
        this.updateStockPrice();
        this.updateStockPriceDataArray();

        //一日当たりの金利収入をcashに追加
        let totalDayIncome = this.calcurateDayIncome_realEstate() + this.calcurateDayIncome_stock() + this.calcurateDayIncome_bonds();
        this.updateCach(totalDayIncome);
    }
    //所持している株の資産総額を計算する関数
    calcurateStockAsset(){
        let total = 0;
        for(let itemName in this.itemStatus){
            if(this.itemStatus[itemName]["type"] == "stock"){
                let possession = this.itemStatus[itemName]["possession"];
                let price = this.itemStatus[itemName]["price"];
                total += possession * price;
            }
        }
        return total;
    }
    //一日当たりのStockの収入を計算する関数
    calcurateDayIncome_stock(){
        let total = 0;
        for(let itemName in this.itemStatus){
            if(this.itemStatus[itemName]["type"] == "stock"){
                let possession = this.itemStatus[itemName]["possession"];
                let effect = this.itemStatus[itemName]["effect"];
                let price = this.itemStatus[itemName]["price"];
                total += possession * price * effect;
            }
        }
        return total;
    }
    //一日当たりのBondsの収入を計算する関数
    calcurateDayIncome_bonds(){
        let total = 0;
        for(let itemName in this.itemStatus){
            if(this.itemStatus[itemName]["type"] == "bonds"){
                let possession = this.itemStatus[itemName]["possession"];
                let effect = this.itemStatus[itemName]["effect"];
                let price = this.itemStatus[itemName]["price"];
                total += possession * price * effect;
            }
        }
        return total;
    }
    //一日当たりのreal Estateの収入を計算する関数
    calcurateDayIncome_realEstate(){
        let total = 0;
        for(let itemName in this.itemStatus){
            if(this.itemStatus[itemName]["type"] == "real Estate"){
                let possession = this.itemStatus[itemName]["possession"];
                let effect = this.itemStatus[itemName]["effect"];
                total += possession * effect;
            }
        }
        return total;
    }
    //株のデータ配列を更新する関数
    updateStockPriceDataArray(){
        for(let itemName in this.itemStatus){
            if(this.itemStatus[itemName]["type"] == "stock"){
                let array = this.itemStatus[itemName]["stockDataArray"];
                let newData = this.itemStatus[itemName]["price"];
                if(array.length < 150){
                    this.itemStatus[itemName]["stockDataArray"].push(newData);
                }else{
                    array.push(newData);
                    this.itemStatus[itemName]["stockDataArray"] = array.slice(1);
                }
            }
        }
    }
    //stockの金額を更新する関数
    updateStockPrice(){
        for(let itemName in this.itemStatus){
            if(this.itemStatus[itemName]["type"] == "stock"){
                let price = this.itemStatus[itemName]["price"];
                let width = HelperFunction.getRandomInteger(price / 50, price / 50 * -1);
                this.itemStatus[itemName]["price"] += width;
            }
        }
    }
    //所持金を更新する関数
    updateCach(amount){
        this.cash += amount;
    }
    //アイテムを買って所持数,所持金を更新する関数
    buyItem(itemName, count){
        this.itemStatus[itemName]["possession"] += count;
        let total = this.itemStatus[itemName]["price"] * count;
        this.updateCach(total * -1);
    }
    //アイテムを売って所持数,所持金を更新する関数
    sellItem(itemName, count){
        this.itemStatus[itemName]["possession"] -= count;
        let total = this.itemStatus[itemName]["price"] * count;
        this.updateCach(total);
    }
}
//ページとグラフを格納しておくためのConfigクラス
class Config{
    static SettingPage = document.getElementById("settingPage");
    static MainPage = document.getElementById("mainPage");
    static SidePage = document.getElementById("sidePage");
    static StockChart = null;
}
class HelperFunction{
    static getRandomInteger(max, min){
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}
class Image{
    //ユーザーのアバター(アバター名 : url)
    static UserAvators = {
        "Boy born from a peach" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-momotaro.png?raw=true",
        "Boy who could fly" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-peter_pan.png?raw=true",
        "Princess who is white as snow" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-shirayuki_hime.png?raw=true"
    }
    //パートナーのアバター(アバター名 : url)
    static PartnerAvators = {
        "Cat" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-cat_12.png?raw=true",
        "Dog" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-dog_4.png?raw=true",
        "Chinpangee" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-chimpanzee.png?raw=true",
        "Eagle" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-eagle.png?raw=true"
    }
    //アイコン(アイコン名 : url)
    static Icons = {
        "saveBtn" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/%E3%83%95%E3%83%AD%E3%83%83%E3%83%94%E3%83%BC%E3%83%87%E3%82%A3%E3%82%B9%E3%82%AF%E3%81%AE%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3%E7%B4%A0%E6%9D%90.png?raw=true",
        "resetBtn" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/%E3%83%AA%E3%83%AD%E3%83%BC%E3%83%89%E3%80%81%E3%82%84%E3%82%8A%E7%9B%B4%E3%81%97%E3%81%AE%E3%82%A2%E3%82%A4%E3%82%B3%E3%83%B3.png?raw=true",
        "Hambarger" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-hamburger.png?raw=true"
    }
    //アイテム
    static Items = [
        {"name" : "Flip machine",
         "type" : "ability",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-frypan.png?raw=true",
         "price" : 15000,
         "effect" : 25,
         "effectUnit" : "$",
         "maxPurchase" : 500},
        {"name" : "ETF Stock",
         "type" : "stock",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-finance_kabu.png?raw=true",
         "price" : 300000,
         "effect" : 0.1,
         "effectUnit" : "%",
         "maxPurchase" : Number.POSITIVE_INFINITY},
        {"name" : "ETF Bonds",
         "type" : "bonds",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-finance_dollar.png?raw=true",
         "price" : 300000,
         "effect" : 0.07,
         "effectUnit" : "%",
         "maxPurchase" : Number.POSITIVE_INFINITY},
        {"name" : "Coffee Stand",
         "type" : "real Estate",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-coffee_3.png?raw=true",
         "price" : 30000,
         "effect" : 30,
         "effectUnit" : "$",
         "maxPurchase" : 1000},
        {"name" : "Soft Cream Truck",
         "type" : "real Estate",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-softcream.png?raw=true",
         "price" : 100000,
         "effect" : 120,
         "effectUnit" : "$",
         "maxPurchase" : 500},
        {"name" : "House",
         "type" : "real Estate",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-house_5.png?raw=true",
         "price" : 20000000,
         "effect" : 32000,
         "effectUnit" : "$",
         "maxPurchase" : 100},
        {"name" : "TownHouse",
         "type" : "real Estate",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-housing_9.png?raw=true",
         "price" : 40000000,
         "effect" : 64000,
         "effectUnit" : "$",
         "maxPurchase" : 100},
        {"name" : "Convenience Store",
         "type" : "real Estate",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-convini.png?raw=true",
         "price" : 100000000,
         "effect" : 250000,
         "effectUnit" : "$",
         "maxPurchase" : 100},
        {"name" : "Mansion",
         "type" : "real Estate",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-building_10.png?raw=true",
         "price" : 250000000,
         "effect" : 500000,
         "effectUnit" : "$",
         "maxPurchase" : 20},
        {"name" : "Industrial Space",
         "type" : "real Estate",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-factory.png?raw=true",
         "price" : 1000000000,
         "effect" : 2200000,
         "effectUnit" : "$",
         "maxPurchase" : 10},
        {"name" : "Hotel Skyscraper",
         "type" : "real Estate",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-building_5.png?raw=true",
         "price" : 10000000000,
         "effect" : 25000000,
         "effectUnit" : "$",
         "maxPurchase" : 5},
        {"name" : "Stadium",
         "type" : "real Estate",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-stadium.png?raw=true",
         "price" : 100000000000,
         "effect" : 5000000000,
         "effectUnit" : "$",
         "maxPurchase" : 2},
        {"name" : "Bullet-Speed Sky Railway",
         "type" : "real Estate",
         "url" : "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-shinkansen_type100.png?raw=true",
         "price" : 10000000000000,
         "effect" : 30000000000,
         "effectUnit" : "$",
         "maxPurchase" : 1}
    ]
}
//画面表示に関する関数を囲ったViewクラス
class View{
    //タイトル画面を作成する関数
    static titleCon(titleString, titleStyle, titleImgUrl, textStyle){
        let container = document.createElement("div");
        container.innerHTML = `
            <p class="${titleStyle} text-center">${titleString}</p>

            <div class="d-flex justify-content-center py-3">
                <div class="img-lg-box"> 
                    <img src="${titleImgUrl}" class="gray">
                </div>
            </div>

            <form id="loadOrNew-form" class="form">
                <div class="form-group d-flex flex-column align-items-center">
                    <div class="form-check pe-4">
                        <input class="radio-input" type="radio" name="radioSelect" id="radioSelect1" value="load" checked required>
                        <label class="radio-triangle ${textStyle}" for="radioSelect1">
                            load
                        </label>
                    </div>
                    <div class="form-check pe-4">
                        <input class="radio-input" type="radio" name="radioSelect" id="radioSelect2" value="new" required>
                        <label class="radio-triangle ${textStyle}" for="radioSelect2">
                            new
                        </label>
                    </div>
                </div>
                <div class="d-flex justify-content-center mt-3">
                    <button type="submit" class="btn-style rounded ${textStyle}">Game Start</button>
                </div>
            </form>        
        `;
        let loadOrNewForm = container.querySelectorAll("#loadOrNew-form").item(0);
        loadOrNewForm.addEventListener("submit", function(){
            let value = loadOrNewForm.querySelectorAll(`input[name="radioSelect"]:checked`).item(0).value;
            if(value == "load"){
                Control.updatePageContent(Config.SettingPage, View.loadStartPage("small-text", titleString, titleStyle, titleImgUrl, textStyle));
            }else if(value == "new"){
                Control.updatePageContent(Config.SettingPage, View.newStartPage("small-text"));
            }
            event.preventDefault();
        })
        return container;
    }
    //タイトル画面でloadを選択した場合に表示するページを作成する関数
    static loadStartPage(textStyle, back_titleString, back_titleStyle, back_titleImgUrl, back_textStyle){
        let container = document.createElement("div");
        container.classList.add("d-flex", "flex-column", "align-items-center");
        //localStorageからセーブデータを文字列で読み込む
        let userJsonString = localStorage.getItem("saveData");
        //セーブデータがない場合
        if(userJsonString === null){
            container.innerHTML = `
                <div class="col-8 border-dotted ${textStyle} p-3 text-center">
                    No data...
                </div>
                <form class="form col-8 mt-3 d-flex flex-column align-items-center">
                    <button type="button" class="btn-style rounded ${textStyle} col-12 mt-2">Go back</button>
                </form> 
            `;
            container.querySelectorAll("button").item(0).addEventListener("click", function(){
                Control.updatePageContent(Config.SettingPage, View.titleCon("Clicker Empire Game", "large-text", "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-hamburger.png?raw=true", "small-text"));
            })
            return container;
        }
        //読み込んだ文字列データをオブジェクトに変換する
        let userJsonDecoded = JSON.parse(userJsonString);
        container.innerHTML = `
            <div class="col-8 border-dotted ${textStyle} p-3">
                <div class="d-flex justify-content-between ">
                    <p>Name</p><p>${userJsonDecoded.name}</p>
                </div>
                <div class="d-flex justify-content-between">
                    <p>Age</p><p>${userJsonDecoded.age} years old</p>
                </div>
                <div class="d-flex justify-content-between">
                    <p>Cash</p><p>$${userJsonDecoded.cash}</p>
                </div>
                <div class="d-flex justify-content-between">
                    <p>Total time played</p><p>${userJsonDecoded.totalTimePlayed} days</p>
                </div>
            </div>

            <form class="form col-8 mt-3 d-flex flex-column align-items-center">
                <button type="submit" class="btn-style rounded ${textStyle} col-12">Start with this save data</button>
                <button type="button" class="btn-style rounded ${textStyle} col-12 mt-2">Go back</button>
            </form>        
        `;
        let form = container.querySelectorAll("form").item(0);
        let backBtn = form.querySelectorAll("button").item(1);
        backBtn.addEventListener("click", function(){
            Control.updatePageContent(Config.SettingPage, View.titleCon(back_titleString, back_titleStyle, back_titleImgUrl, back_textStyle));
        })
        form.addEventListener("submit", function(){
            Control.displayNone(Config.SettingPage);
            Control.displayBlock(Config.MainPage);
            //ユーザーのプレイ状態をプレイ中にする
            userJsonDecoded.active = true;
            //userJsonDecodedを基に、新たにユーザアカウントを作成し直す
            let user = User.remakeUserFromJsonDecoded(userJsonDecoded);
            //MainPageを表示
            Control.updatePageContent(Config.MainPage, View.mainPage(user, textStyle));
            //１秒ごとにアカウント情報を更新する処理をスタート
            Control.timeControl(user);

            event.preventDefault();
        })
        return container;
    }
    //ユーザー名を入力するページを作成する関数
    static nameFormCon_SettingPage(textStyle, titleString){
        let container = document.createElement("div");
        container.innerHTML = `
            <p class="${textStyle}">${titleString}</p>
            <form class="form">
                <div class="form-group my-3">
                    <input type="text" name="userName" class="${textStyle} input-style col-12 p-0 ps-2 rounded" placeholder="Input user name" value="" required>
                </div>
                <div class="d-flex justify-content-end">
                    <button type="submit" class="btn-style rounded ${textStyle}">Next</button>
                </div>
            </form>
        `;
        return container;
    }
    //年齢を入力するページを作成する関数
    static ageFormCon_SettingPage(textStyle, titleString){
        let container = document.createElement("div");
        container.innerHTML = `
            <p class="${textStyle}">${titleString}</p>
            <form class="form">
                <div class="form-group my-3">
                    <input type="text" name="userAge" class="${textStyle} input-style col-12 p-0 ps-2 rounded" placeholder="Input user age" value="" required>
                </div>
                ${View.backNextBtn("Go back", "Next","d-flex justify-content-between").innerHTML}
            </form>
        `;
        return container;
    }
    //ユーザーのアバターを選択するページを作成する関数
    static userAvatorFormCon_SettingPage(textStyle, titleString){
        //ユーザーのアバターを選択するページ(userAvatorFormCon)
        let container = document.createElement("div");
        let userAvatorForm_selectHTML = `<option hidden value="">Select your appearance</option>`;
        for(let key in Image.UserAvators){
            userAvatorForm_selectHTML += `
            <option value="${key}">"${key}</option>
            `;
        }
        container.innerHTML = `
            <p class="${textStyle}">${titleString}</p>
                    
            <form class="form">
                <select class="col-12 input-style my-2 ${textStyle}" required>
                    ${userAvatorForm_selectHTML}
                </select>
                <div class="d-flex justify-content-center">
                    <div class="img-lg-box">
                        <img class="gray">
                    </div>
                </div>
                ${View.backNextBtn("Go back", "Next","d-flex justify-content-between").innerHTML}
            </form>
        `;
        return container;
    }
    //相棒のアバターを選択するページを作成する関数
    static partnerAvatorFormCon_SettingPage(textStyle, titleString){
        let container = document.createElement("div");
        let partnerAvatorForm_selectHTML = `<option hidden value="">Select your partner</option>`;
        for(let key in Image.PartnerAvators){
            partnerAvatorForm_selectHTML += `
            <option value="${key}">${key}</option>
            `;
        }
        container.innerHTML = `
            <p class="${textStyle}">${titleString}</p>
                    
            <form class="form">
                <select class="col-12 input-style my-2 ${textStyle}" required>
                    ${partnerAvatorForm_selectHTML}
                </select>
                <div class="d-flex justify-content-center">
                    <div class="img-lg-box">
                        <img class="gray">
                    </div>
                </div>
                ${View.backNextBtn("Go back", "Next","d-flex justify-content-between").innerHTML}
            </form>
        `;
        return container;
    }
    //タイトルページでnewを選択した場合に表示するページを作成する関数
    static newStartPage(textStyle){
        //プレイヤーによって入力された情報を格納する変数を作成(userName, userAge, userAvatorString, partnerAvatorString)
        let userName;
        let userAge;
        let userAvatorString;
        let partnerAvatorString;
        //introductionページ１(introCon1)
        let introCon1 = document.createElement("div");
        introCon1.classList.add("d-flex", "flex-column", "align-items-center");
        //introductionページ１の文字列要素(introStringDiv)
        let introStringDiv = document.createElement("div");
        introStringDiv.classList.add("col-8", "border-dotted", textStyle, "text-left", "p-3");
        introStringDiv.innerHTML = `Hello!<br>Welcome to the wonderful world of Clicker Empire Game.`;
        let introForm = document.createElement("form");
        introForm.classList.add("form", "col-8", "mt-3", "d-flex", "justify-content-end");
        //introductionページ１のnextBtn(intro1_NextBtn)
        let intro1_NextBtn = document.createElement("button");
        introForm.append(intro1_NextBtn);
        intro1_NextBtn.classList.add("btn-style", "rounded", textStyle);
        intro1_NextBtn.innerHTML = "Next";
        introCon1.append(introStringDiv, introForm);
　　　　//introductionページ２(introCon2)
        let introCon2 = introCon1.cloneNode(true);
        introCon2.querySelectorAll("div").item(0).innerHTML = `At first, please tell me about you.`;
        //introductionページ１のnextBtnにイベントリスナーを追加
        intro1_NextBtn.addEventListener("click", function(){
            //SettingPageの中身をintroCon2に更新
            Control.updatePageContent(Config.SettingPage, introCon2);
        })
        //ユーザー名を入力するページ(nameFormCon)
        let nameFormCon = View.nameFormCon_SettingPage(textStyle, "What your name?")
        //introductionページ2のnextBtn(intro2_NextBtn)
        let intro2_NextBtn = introCon2.querySelectorAll("button").item(0);
        intro2_NextBtn.addEventListener("click", function(){
            //SettingPageの中身をnameFormConに更新
            Control.updatePageContent(Config.SettingPage, nameFormCon);
        })
        //年齢を入力するページ(ageFormCon)
        let ageFormCon = View.ageFormCon_SettingPage(textStyle, "How old are you?");
        //ユーザ名を入力するform(nameForm)にsubmitのイベントリスナーを追加
        let nameForm = nameFormCon.querySelectorAll("form").item(0);
        //nameFormのNextBtnがクリックされた時のイベント
        nameForm.addEventListener("submit", function(){
            //入力されたユーザ名を取得(nameForm_Value)
            let nameForm_Value = nameForm.querySelectorAll("input").item(0).value;
            //変数UserNameの値を更新
            userName = nameForm_Value;
            //SettingPageの中身をageFormConに更新
            Control.updatePageContent(Config.SettingPage, ageFormCon);
        })
        //ageFormConのBackBtn(ageForm_BackBtn)
        let ageForm_BackBtn = ageFormCon.querySelectorAll("button").item(0);
        ageForm_BackBtn.addEventListener("click", function(){
            Control.updatePageContent(Config.SettingPage, nameFormCon);
        })
        //ユーザーのアバターを選択するページ(userAvatorFormCon)
        let userAvatorFormCon = View.userAvatorFormCon_SettingPage(textStyle, "Which is your appearance?");
        //ユーザーのアバターを選択するページのformタグ(userAvatorForm)
        let userAvatorForm = userAvatorFormCon.querySelectorAll("form").item(0);
        //userAvatorFormのselectタグ(userAvatorForm_Select)
        let userAvatorForm_Select = userAvatorForm.querySelectorAll("select").item(0);
        //userAvatorFormのimgタグ(userAvatorFormImg)
        let userAvatorForm_Img = userAvatorForm.querySelectorAll("img").item(0);
        //userAvatorForm_Selectの値が変更されると、userAvatorFormImgのsrcを変更して対応する画像を表示する。
        userAvatorForm_Select.addEventListener("change", function(){
            let currValue = userAvatorForm_Select.value;
            let url = Image.UserAvators[currValue];
            userAvatorForm_Img.src = url;
        })
        //年齢を入力するform(ageForm)にsubmitのイベントリスナーを追加
        let ageForm = ageFormCon.querySelectorAll("form").item(0);
        //ageFormのNextBtnがクリックされた時のイベント
        ageForm.addEventListener("submit", function(){
            //入力された年齢を取得
            let ageForm_IntValue = parseInt(ageForm.querySelectorAll("input").item(0).value);
            if(ageForm_IntValue >= 0){
                //変数userAgeの値を更新
                userAge = ageForm_IntValue;
                //SettingPageの中身をuserAvatorFormConに更新
                Control.updatePageContent(Config.SettingPage, userAvatorFormCon);
            }
            else{
                alert('Please enter a number larger than 0.');
                event.preventDefault();
            }
        })
        //userAvatorFormのBackBtn(userAvatorForm_BackBtn)
        let userAvatorForm_BackBtn = userAvatorForm.querySelectorAll("button").item(0);
        userAvatorForm_BackBtn.addEventListener("click", function(){
            Control.updatePageContent(Config.SettingPage, ageFormCon);
        })
        //相棒のアバターを選択するページ(partnerAvatorFormCon)
        let partnerAvatorFormCon = View.partnerAvatorFormCon_SettingPage(textStyle, "Which is your partner?");
        //相棒のアバターを選択するページのform(partnerAvatorForm)
        let partnerAvatorForm = partnerAvatorFormCon.querySelectorAll("form").item(0);
        //partnerAvatorFormのselectタグ(partnerAvatorForm_Select)
        let partnerAvatorForm_Select = partnerAvatorForm.querySelectorAll("select").item(0);
        //partnerAvatorFormのimgタグ(partnerAvatorFormImg)
        let partnerAvatorForm_Img = partnerAvatorForm.querySelectorAll("img").item(0);
        //partnerAvatorForm_Selectの値が変更されると、partnerAvatorFormImgのsrcを変更して対応する画像を表示する。
        partnerAvatorForm_Select.addEventListener("change", function(){
            let currValue = partnerAvatorForm_Select.value;
            let url = Image.PartnerAvators[currValue];
            partnerAvatorForm_Img.src = url;
        })
        //userAvatorFormのNextBtnがクリックされた時のイベント
        userAvatorForm.addEventListener("submit", function(){
            //選択されたユーザーのアバターの値を取得
            let userAvatorForm_Value = userAvatorForm_Select.value;
            //変数userAvatorStringの値を更新
            userAvatorString = userAvatorForm_Value;
            //SettingPageの中身をpartnerAvatorFormConに更新
            Control.updatePageContent(Config.SettingPage, partnerAvatorFormCon);
        })
        //partnerAvatorFormのBackBtn(partnerAvatorForm_BackBtn)
        let partnerAvatorForm_BackBtn = partnerAvatorForm.querySelectorAll("button").item(0);
        partnerAvatorForm_BackBtn.addEventListener("click", function(){
            Control.updatePageContent(Config.SettingPage, userAvatorFormCon);
        })
        //partnerAvatorFormのnextBtnがクリックされた時のイベント
        partnerAvatorForm.addEventListener("submit", function(){
            //選択された相棒のアバターの値を取得
            let partnerAvatorForm_Value = partnerAvatorForm_Select.value;
            //Userクラスのクラス変数PartnerAvatorStringの値を更新
            partnerAvatorString = partnerAvatorForm_Value;

            //入力された情報を確認してゲームを始めるページ(confirmCon)
            let confirmCon = document.createElement("div");
            Control.updatePageContent(Config.SettingPage, confirmCon);
            confirmCon.innerHTML = `
                <div class="d-flex flex-column align-items-center">
                    <div class="col-10 border-dotted p-3 d-flex justify-content-around">
                        <div class="col-4 d-flex flex-column align-items-end p-3">
                            <div class="img-w100-box">
                                <img src="${Image.UserAvators[userAvatorString]}" class="gray">
                            </div>
                            <div class="img-w50-box">
                                <img src="${Image.PartnerAvators[partnerAvatorString]}" class="gray">
                            </div>
                                
                        </div>
                        <div class="col-8 ms-3 ${textStyle}">
                            <div class="d-flex justify-content-between">
                                <p class="col-6">Name: </p><p class="col-6">${userName}</p>
                            </div>
                            <div class="d-flex justify-content-between">
                                <p class="col-6">Age: </p><p class="col-6">${userAge}</p>
                            </div>
                            <div class="d-flex justify-content-between">
                                <p class="col-6">Avator: </p><p class="col-6">${userAvatorString}</p>
                            </div>
                            <div class="d-flex justify-content-between">
                                <p class="col-6">Partner: </p><p class="col-6">${partnerAvatorString}</p>
                            </div>
                        </div>
                    </div>
                
                    <form class="form col-4 mt-3 d-flex flex-column align-items-center">
                        
                        <button type="button" class="btn-style rounded w-100 ${textStyle} mb-2">Game Start</button>
                        <button type="button" class="btn-style rounded w-100 ${textStyle}">Go back</button>
                    </form>
                </div>
            `;

            //confirmConのbackBtn(confirm_BackBtn)
            let confirm_BackBtn = confirmCon.querySelectorAll("button").item(1);
            confirm_BackBtn.addEventListener("click", function(){
                Control.updatePageContent(Config.SettingPage, partnerAvatorFormCon);
            })
            //confirmConのnextBtn(confirm_NextBtn)がクリックされた時のイベント
            let confirm_NextBtn = confirmCon.querySelectorAll("button").item(0);
            confirm_NextBtn.addEventListener("click", function(){
                //SettingPageを非表示にしてMainPageを表示する
                Control.displayNone(Config.SettingPage);
                Control.displayBlock(Config.MainPage);
                //ユーザアカウントを作成する
                let userAccount = new User(userName, userAge, userAvatorString, partnerAvatorString);
                //MainPageを作成して表示する
                Control.updatePageContent(Config.MainPage, View.mainPage(userAccount, textStyle));
                //１秒ごとにアカウント情報を更新する処理をスタート
                Control.timeControl(userAccount);
            })
        })
    
        return introCon1;
    }
    //メイン画面を作成する関数
    static mainPage(userAccount, textStyle){
        let container = document.createElement("div");
        //保存・リセットアイコンのセクション(iconSec)
        let iconSec = document.createElement("div");
        container.append(iconSec);
        iconSec.classList.add("d-flex", "justify-content-end");
        //保存ボタン(saveBtn)
        let saveBtn = document.createElement("button");
        saveBtn.id = "saveBtn";
        saveBtn.type = "button";
        saveBtn.classList.add("icon-btn");
        saveBtn.innerHTML = `
            <img src="${Image.Icons[saveBtn.id]}" class="gray icon">
        `;
        saveBtn.addEventListener("click", function(){
            let fog = container.querySelectorAll(".fog").item(0);
            Control.displayBlock(fog);
            Control.displayBlock(Config.SidePage);
            //確認画面を作成
            let jsonConfirmPage = View.jsonConfirm_SidePage(userAccount, "save", textStyle);
            let jsonForm = jsonConfirmPage.querySelectorAll("form").item(0);
            jsonForm.addEventListener("submit", function(){
                let value = jsonForm.querySelectorAll(`input[name="radioSelect"]:checked`).item(0).value;
                if(value == "Yes"){
                    Control.displayNone(fog);
                    //ユーザーのプレイ状態を変更(ログアウトして1秒ごとの更新を中断)
                    userAccount.active = false;
                    //ユーザーオブジェクトを文字列に変換し、localStorageに保存
                    let userJsonString = JSON.stringify(userAccount);
                    localStorage.setItem("saveData", userJsonString);
                    //タイトル画面に戻る
                    Control.displayNone(Config.SidePage);
                    Control.displayNone(Config.MainPage);
                    Control.displayBlock(Config.SettingPage);
                    Control.updatePageContent(Config.SettingPage, View.titleCon("Clicker Empire Game", "large-text", "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-hamburger.png?raw=true", "small-text"));
                    alert("Saving your data has completed");
                }else if(value == "No"){
                    Control.displayNone(fog);
                    Control.displayNone(Config.SidePage);
                }
                event.preventDefault();
            })
            Control.updatePageContent(Config.SidePage, jsonConfirmPage);
        })
        
        //リセットボタン(resetBtn)
        let resetBtn = saveBtn.cloneNode(true);
        resetBtn.id = "resetBtn";
        resetBtn.classList.add("ms-2");
        let resetBtnImg = resetBtn.querySelectorAll("img").item(0);
        resetBtnImg.src = Image.Icons[resetBtn.id];
        resetBtn.addEventListener("click", function(){
            if(localStorage.getItem("saveData") == null){
                alert("Save data is nothing.");
            }else{
                let fog = container.querySelectorAll(".fog").item(0);
                Control.displayBlock(fog);
                Control.displayBlock(Config.SidePage);
                let saveData = User.remakeUserFromJsonDecoded(JSON.parse(localStorage.getItem("saveData")));
                let jsonConfirmPage = View.jsonConfirm_SidePage(saveData, "reset", textStyle);
                let jsonForm = jsonConfirmPage.querySelectorAll("form").item(0);
                jsonForm.addEventListener("submit", function(){
                    let value = jsonForm.querySelectorAll(`input[name="radioSelect"]:checked`).item(0).value;
                    if(value == "Yes"){
                        Control.displayNone(fog);
                        //データを削除してタイトル画面へ
                        LineChart.destroyChartList();
                        //ユーザーのプレイ状態を変更(ログアウトして1秒ごとの更新を中断)
                        userAccount.active = false;
                        //セーブデータを削除
                        localStorage.removeItem("saveData");
                        //タイトル画面に戻る
                        Control.displayNone(Config.SidePage);
                        Control.displayNone(Config.MainPage);
                        Control.displayBlock(Config.SettingPage);
                        Control.updatePageContent(Config.SettingPage, View.titleCon("Clicker Empire Game", "large-text", "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-hamburger.png?raw=true", "small-text"));
                        alert("Your data has been deleted");
                    }else if(value == "No"){
                        Control.displayNone(fog);
                        Control.displayNone(Config.SidePage);
                    }
                    event.preventDefault();
                })
                Control.updatePageContent(Config.SidePage, jsonConfirmPage);
            }
        })
        iconSec.append(saveBtn, resetBtn);
        //ユーザーのステータスを表示するセクション(statusSec)
        let statusSec = document.createElement("div");
        container.append(statusSec);
        statusSec.classList.add("d-flex", "align-items-center");
        statusSec.innerHTML = `
            <div class="col-12 d-flex justify-content-between ">
                <div class="col-3">
                    <div class="d-flex justify-content-center align-items-end">
                        <div class="img-w60-box">
                            <img src="${Image.UserAvators[userAccount.userAvatorString]}" class="gray avator">
                        </div>
                        <div class="img-w30-box">
                            <img src="${Image.PartnerAvators[userAccount.partnerAvatorString]}" class="gray avator">
                        </div>
                    </div>
                </div>
                <div class="col-9 d-flex align-items-center ps-2">
                    <div class="col-12 d-flex justify-content-around ${textStyle}">
                        <div class="col-4">
                            Name: ${userAccount.name}<br>
                            <div id="ageStatus">Age: ${userAccount.age} years old</div>
                        </div>
                        <div class="col-4 px-2">
                            <div id="cashStatus">Cach: $${userAccount.cash}</div>
                            <div id="stockStatus">Stock: $${userAccount.calcurateStockAsset()}</div>
                        </div>
                        <div class="col-4">
                            <div id="totalTimePlayedStatus">Total: ${userAccount.totalTimePlayed} days</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        //ページ下部のflexSec
        let flexSec = document.createElement("div");
        container.append(flexSec);
        flexSec.classList.add("d-flex", "flex-wrap", "align-items-center");

        //ハンバーガーをクリックするセクション(bargerSec)
        let bargerSec = document.createElement("div");
        flexSec.append(bargerSec);
        bargerSec.classList.add("col-12", "col-md-3", "d-flex", "flex-column", "justify-content-center", "align-items-center", textStyle);
        bargerSec.innerHTML = `
            <p class="text-center">+$${userAccount.hambarger["effect"]}/click</p>
            <div class="img-md-box">
                <img id="bargerBtn" src="${Image.Icons["Hambarger"]}" class="gray">
            </div>
            <p id="hambargerTotal" class="text-center">Total: ${userAccount.hambarger["total"]} bargers</p>
        `;
        //ハンバーガーの画像をクリックした時のイベントハンドラを追加
        let bargerBtn = bargerSec.querySelector("#bargerBtn");
        bargerBtn.addEventListener("mousedown", function(){
            bargerBtn.classList.add("barger-click");
            //Cashを更新
            userAccount.updateCach(userAccount.hambarger["effect"]);
            statusSec.querySelector("#cashStatus").innerHTML = `Cach: $${userAccount.cash}`;
            //ハンバーガーの個数を更新
            userAccount.hambarger["total"] += 1;
            bargerSec.querySelector("#hambargerTotal").innerHTML = `Total: ${userAccount.hambarger["total"]} bargers`;
        })
        bargerBtn.addEventListener("mouseup", function(){
            bargerBtn.classList.remove("barger-click");
        })
        
        //アイテムを表示するセクション(itemSec)
        let itemSec = document.createElement("div");
        flexSec.append(itemSec);
        itemSec.classList.add("itemSec-style", "col-12", "col-md-9", textStyle);
        
        //Image.Itemsをループして全てのアイテムをitemSecに追加する
        for(let i = 0; i < Image.Items.length; i++){
            //現在のアイテム(currItem)
            let currItem = Image.Items[i];
            //アイテムの名前(itemName)
            let itemName = currItem["name"];
            //アイテムのタイプ(type)
            let type = currItem["type"];
            //アイテムの効果を文字列で表す(effectString)
            let effectString = View.effectString(currItem);
            //現在のアイテム(currItem)をユーザーが何個持っているかを取得する(possession)
            let possession = userAccount.itemStatus[itemName]["possession"];

            let maxPurchase = Number.isFinite(currItem["maxPurchase"]) ? currItem["maxPurchase"].toString() : "∞";
        
            //アイテムの情報を表示する要素(itemDiv)
            let itemDiv = document.createElement("div");
            itemDiv.id = itemName;
            itemDiv.classList.add("d-flex", "item");
            itemDiv.innerHTML = `
                <div class="col-2 p-2 p-relative">
                    <img src="${currItem["url"]}" class="gray">
                </div>
                <div class="col-10 d-flex align-items-center text-center">
                    <div class="col-4 d-flex flex-column">
                        <div>${itemName}</div>
                        <div>$${currItem["price"]}</div>
                    </div>
                    <div class="col-4">
                        <p>${effectString}</p>
                    </div>
                    <div class="col-4">
                        <p>${possession}/${maxPurchase}</p>
                    </div>
                </div>
            `;
            //itemDivのimgタグ(itemImg)
            let itemImg = itemDiv.querySelectorAll("img").item(0);
            //itemDivにマウスを合わせるとitemImgの色をカラー表示するイベントハンドラを追加
            itemDiv.addEventListener("mouseover", function(){
                itemImg.classList.add("gray-hover");
            })
            //itemDivからマウスを外すとitemImgの色をグレー表示に戻すイベントハンドラを追加
            itemDiv.addEventListener("mouseleave", function(){
                itemImg.classList.remove("gray-hover");
            })
            //itemDivをクリックすると、対応するアイテムのサイドページを表示するイベントハンドラを追加する
            itemDiv.addEventListener("click", function(){
                let fog = container.querySelectorAll(".fog").item(0);
                Control.displayBlock(fog);
                Control.displayBlock(Config.SidePage);
                Control.updatePageContent(Config.SidePage, View.item_SidePage(userAccount, container, itemName, type, effectString, textStyle));
            })
            itemSec.append(itemDiv);
        }
        //sidePageを表示する時にmainPageを隠すためのfog
        let fog = document.createElement("div");
        container.append(fog);
        fog.classList.add("fog", "d-none");

        return container;
    }
    static jsonConfirm_SidePage(userAccount, mode, textStyle){
        let container = document.createElement("div");
        container.id = mode;
        container.classList.add("border-double", "p-2", "d-flex", "justify-content-center", "align-items-center");
        container.innerHTML = `
            <div>
                <div id="jsonStatusConform" class="${textStyle} border-dotted my-2 p-2 text-center">
                    <p>Name: ${userAccount.name}</p>
                    <p id="jsonAge">Age: ${userAccount.age}</p>
                    <p id="jsonCash">Cash: ${userAccount.cash}</p>
                    <p id="jsonTotalTimePlayed">Total time played: ${userAccount.totalTimePlayed} days</p>
                </div>
                <div class="${textStyle} text-center">
                    Do you really ${mode}?
                </div>
                <form class="form my-2">
                    <div class="form-group d-flex flex-column align-items-center">
                        <div class="form-check pe-4">
                            <input class="radio-input" type="radio" name="radioSelect" id="radioSelect1" value="Yes" checked required>
                            <label class="radio-triangle ${textStyle}" for="radioSelect1">
                                Yes
                            </label>
                        </div>
                        <div class="form-check pe-4">
                            <input class="radio-input" type="radio" name="radioSelect" id="radioSelect2" value="No" required>
                            <label class="radio-triangle ${textStyle}" for="radioSelect2">
                                No
                            </label>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center my-2">
                        <button type="submit" class="btn-style rounded ${textStyle}">Decision</button>
                    </div>
                </form>
            </div>        
        `;
        return container;
    }
    static item_SidePage(userAccount, mainPageEle, itemName, type, effectString, textStyle){
        let container = document.createElement("div");
        container.classList.add("border-double", "p-2");
        //アイテムの情報を表示するinfoSec
        let infoSec = document.createElement("div");
        container.append(infoSec);
        infoSec.classList.add("d-flex", "mh-px120");
        //userAccountが持っているitemNameの情報を取得(itemMap)
        let itemMap = userAccount.itemStatus[itemName];
        //アイテムの値段(price)
        let price = itemMap["price"];
        //アイテムの最大購入数を取得(maxPurchase)
        let maxPurchase = itemMap["maxPurchase"];
        let maxPurchaseString = Number.isFinite(maxPurchase) ? maxPurchase : "∞";
        infoSec.innerHTML = `
            <div class="col-8 d-flex flex-column align-items-center">
                <div class="col-12">
                    <div id="itemName" class="middle-text">${itemName}</div>
                </div>
                <div id="details" class="col-10 small-text">
                    <div id="itemPrice">Price: $${price}/each</div>
                    <div id="stockPrice"></div>
                    <div id="itemEffect">Effect: ${effectString}</div>
                    <div id="itemMaxPurchases">Max purchases: ${maxPurchaseString}</div>
                    <div id="itemPossession"></div>
                </div>
            </div>
            <div class="col-4 p-2">
                <img src="${itemMap["url"]}" class="gray">
            </div>        
        `;
        //株に表示するDiv
        let stockOnly_Div = document.createElement("div");
        container.append(stockOnly_Div);
        //アイテムの購入数を決めるcontrolSec
        let controlSec = View.createControlSec_SidePage("buy", textStyle);
        container.append(controlSec);
        //infoSecとcontrolSecを隠すためのfogSec
        let fogSec = document.createElement("div");
        container.append(fogSec);
        fogSec.classList.add("fog", "d-none");
        //controlSecのformタグ(controlForm)
        let controlForm = controlSec.querySelectorAll("form").item(0);
        //controlFormのinputタグ(controlForm_Input)
        let controlForm_Input = controlForm.querySelectorAll("input").item(0);
        let totalP = controlForm.querySelector("#total");
        //controlForm_Inputの値(アイテムの個数)が変更されると、totalPのHTML(値段)を変更するイベントハンドラを設定
        controlForm_Input.addEventListener("change", function(){
            let count = parseInt(controlForm_Input.value);
            totalP.innerHTML = (price * count).toString();
            if(count + itemMap["possession"] > itemMap["maxPurchase"]){
                alert("You have exceeded the limit of the number of possessions");
            }
        })
        //Go backボタン
        let control_BackBtn = controlForm.querySelectorAll(".back").item(0);
        control_BackBtn.addEventListener("click", function(){
            Control.displayNone(Config.SidePage);
            let fog = mainPageEle.querySelectorAll(".fog").item(0);
            Control.displayNone(fog);
            Control.updatePageContent(Config.MainPage, View.mainPage(userAccount, textStyle));
        })
        //Buyボタン
        controlForm.addEventListener("submit", function(){
            let count = parseInt(controlForm_Input.value);
            if(count < 1){
                alert("Please enter the number larger than 1.");
                event.preventDefault();
            }else{
                let cash = userAccount.cash;
                let total = price * count;
                if(count + itemMap["possession"] > itemMap["maxPurchase"]){
                    alert("You have exceeded the limit of the number of possessions");
                    event.preventDefault();
                }else if(cash >= total){
                    fogSec.classList.remove("d-none");
                    let price = itemMap["price"];
                    let count = parseInt(controlForm_Input.value);
                    //確認画面を作成
                    let confirmCon = View.confirmCon_SidePage("buy", itemName, count, price, textStyle);
                    container.append(confirmCon);
                    let confirmForm = confirmCon.querySelectorAll("form").item(0);
                    confirmForm.addEventListener("submit", function(){
                        let value = confirmForm.querySelectorAll(`input[name="radioSelect"]:checked`).item(0).value;
                        if(value == "Yes"){
                            Control.displayNone(fogSec);
                            //アイテムの所持数、所持金を更新
                            userAccount.buyItem(itemName, count);
                            //ハンバーガー1個あたりの収入を更新する
                            if(type == "ability"){
                                userAccount.hambarger["effect"] += itemMap["effect"] * count;
                            }
                        }else if(value == "No"){
                            Control.displayNone(fogSec);
                        }
                        //sidePageを更新する
                        Control.updatePageContent(Config.SidePage, View.item_SidePage(userAccount, mainPageEle, itemName, type, effectString, textStyle));
                        event.preventDefault();
                    })
                }else{
                    alert(`You don't enough money.`);
                    event.preventDefault();
                }
               event.preventDefault();
            }
        })
        //アイテムがstockの時
        if(type == "stock"){
            infoSec.querySelector("#itemPrice").innerHTML = "";
            infoSec.querySelector("#stockPrice").innerHTML = `Price: $${price}/each`;
            //折れ線グラフを囲う要素
            let stockOnly_canvas = document.createElement("div");
            //グラフが描画されたcanvas要素をid(${itemName} canvas)で取得
            let canvas = document.getElementById(`${itemName} canvas`);
            stockOnly_canvas.append(canvas);

            control_BackBtn.addEventListener("click", function(){
                //canvasDivにcanvasを戻す
                let canvasDiv = document.getElementById("canvasDiv");
                canvasDiv.append(canvas);
            })
            //BuyとSellを切り替えるボタンを囲う要素
            let stockOnly_BtnDiv = document.createElement("div");
            stockOnly_BtnDiv.classList.add("d-flex", "justify-content-end");
            stockOnly_Div.append(stockOnly_canvas, stockOnly_BtnDiv);
            stockOnly_BtnDiv.innerHTML = `
                <button type="button" class="btn-style rounded small-text">>>　Go to sell</button>
            `;
            //stockを売る画面に切り替えるボタン
            let btn_goToSell = stockOnly_BtnDiv.querySelectorAll("button").item(0);
            btn_goToSell.addEventListener("click", function(){
                container.innerHTML = "";
                let infoSec_sell = infoSec.cloneNode(true);
                container.append(infoSec_sell);
                //アイテムの情報を書き換える
                infoSec_sell.querySelector("#itemEffect").innerHTML = "";
                infoSec_sell.querySelector("#itemMaxPurchases").innerHTML = "";
                infoSec_sell.querySelector("#itemPossession").innerHTML = `Possession: ${itemMap["possession"]} shares`;
                //グラフはBuy画面と同じものを使う
                let stockOnly_Div_sell = document.createElement("div");
                container.append(stockOnly_Div_sell);
                stockOnly_Div_sell.append(stockOnly_canvas);

                let stockOnly_BtnDiv_sell = stockOnly_BtnDiv.cloneNode(true);
                stockOnly_Div_sell.append(stockOnly_BtnDiv_sell);
                //stockを買う画面に切り替えるボタン
                let btn_goToBuy = stockOnly_BtnDiv_sell.querySelectorAll("button").item(0);
                btn_goToBuy.innerHTML = ">> Go to buy";
                btn_goToBuy.addEventListener("click", function(){
                    Control.updatePageContent(Config.SidePage, View.item_SidePage(userAccount, mainPageEle, itemName, type, effectString, textStyle));
                })

                let controlSec_sell = View.createControlSec_SidePage("sell", textStyle);
                container.append(controlSec_sell);
                
                //controlSec_sellのformタグ(controlForm_sell)
                let controlForm_sell = controlSec_sell.querySelectorAll("form").item(0);

                let fogSec_sell = fogSec.cloneNode(true);
                container.append(fogSec_sell);

                //controlForm_sellのinputタグ(controlForm_Input_sell)
                let controlForm_Input_sell = controlForm_sell.querySelectorAll("input").item(0);
                let totalP_sell = controlForm_sell.querySelectorAll("#total").item(0);
                //controlForm_Input_sellの値(アイテムの個数)が変更されると、totalPのHTML(値段)を変更するイベントハンドラを設定
                controlForm_Input_sell.addEventListener("change", function(){
                    let count = parseInt(controlForm_Input_sell.value);
                    totalP_sell.innerHTML = (price * count).toString();
                    if(count > itemMap["possession"]){
                        alert("Entered number have exceeded the number you have.");
                    }
                })
                //Go backボタン
                let control_BackBtn_sell = controlForm_sell.querySelectorAll(".back").item(0);
                control_BackBtn_sell.addEventListener("click", function(){
                    //canvasDivにcanvasを戻す
                    let canvasDiv = document.getElementById("canvasDiv");
                    canvasDiv.append(canvas);
                    Control.displayNone(Config.SidePage);
                    let fog = mainPageEle.querySelectorAll(".fog").item(0);
                    Control.displayNone(fog);
                    Control.updatePageContent(Config.MainPage, View.mainPage(userAccount, textStyle));
                })
                //Sellボタン
                controlForm_sell.addEventListener("submit", function(){
                    let count = parseInt(controlForm_Input_sell.value);
                    if(count < 1){
                        alert("Please enter the number larger than 1.");
                        event.preventDefault();
                    }else if(count <= itemMap["possession"]){
                        Control.displayBlock(fogSec_sell);
                        let price = itemMap["price"];
                        let confirmCon_sell = View.confirmCon_SidePage("sell", itemName, count, price, textStyle);
                        container.append(confirmCon_sell);
                        let confirmForm_sell = confirmCon_sell.querySelectorAll("form").item(0);
                        confirmForm_sell.addEventListener("submit", function(){
                            let value = confirmForm_sell.querySelectorAll(`input[name="radioSelect"]:checked`).item(0).value;
                            if(value == "Yes"){
                                Control.displayNone(fogSec_sell);
                                //アイテムの所持数,所持金を更新
                                userAccount.sellItem(itemName, count);
                            }
                            if(value == "No"){
                                Control.displayNone(fogSec_sell);
                            }
                            Control.updatePageContent(Config.SidePage, View.item_SidePage(userAccount, mainPageEle, itemName, type, effectString, textStyle));
                            event.preventDefault();
                        })   
                    }else{
                        alert("Entered number have exceeded the number you have.");
                        event.preventDefault();
                    }
                })
            })
        }
        return container;
    }
    //itemの効果を文字列で返す関数
    static effectString(item){
        //アイテムのタイプ(type)
        let type = item["type"];
        //アイテムの効果を文字列で表す(effectString)
        let effectString = "";
        if(type == "real Estate"){
            effectString = `+${item["effectUnit"]}${item["effect"]}/day`;
        }
        if(type == "stock" || type == "bonds"){
            effectString = `+${item["effect"]}${item["effectUnit"]}/day`;
        }
        if(type == "ability"){
            effectString = `+${item["effect"]}${item["effectUnit"]}/click`;
        }
        return effectString;
    }
    //アイテムの売り買いをする際に、数を入力したり戻ったりする操作をするためのコントロール画面を作成する関数
    static createControlSec_SidePage(mode, textStyle){
        let upper = "Buy";
        let lower = "buy";
        if(mode == "sell"){
            upper = "Sell";
            lower = "sell";
        }
        let controlSec = document.createElement("div");
        controlSec.innerHTML = `
            <p class="${textStyle}">How many would you like to ${lower}?</p>
            <form class="form ${textStyle}">
                <div class="form-group">
                    <input type="number" class="input-style col-12 p-0 ps-1 my-1 rounded" placeholder="0" value="" min="0" required>
                </div>
                <div class="d-flex justify-content-end">
                    <p>Total: $</p><p id="total">0</p>
                </div>
                ${View.backNextBtn("Go back", upper, "d-flex justify-content-between my-1").innerHTML}
            </form>        
        `;
        return controlSec;
    }
    //sidePageで"buy"、"sell"のボタンを押したときに表示する確認画面を作成する関数
    static confirmCon_SidePage(mode, itemName, count, price, textStyle){
        let confirmCon = document.createElement("div");
        confirmCon.classList.add("border-double", "bg-color", "confirmDisplay", "d-flex", "justify-content-center", "align-items-center", "p-2");
        confirmCon.innerHTML = `
            <div>
                <div class="${textStyle} border-dotted my-2 p-1 text-center">
                    <p>${itemName}</p>
                    <p>${count} piece($${(price * count).toString()})</p>
                </div>
                <div class="${textStyle} text-center">
                    Do you really ${mode}?
                </div>
                <form class="form my-2">
                    <div class="form-group d-flex flex-column align-items-center">
                        <div class="form-check pe-4">
                            <input class="radio-input" type="radio" name="radioSelect" id="radioSelect1" value="Yes" checked required>
                            <label class="radio-triangle ${textStyle}" for="radioSelect1">
                                Yes
                            </label>
                        </div>
                        <div class="form-check pe-4">
                            <input class="radio-input" type="radio" name="radioSelect" id="radioSelect2" value="No" required>
                            <label class="radio-triangle ${textStyle}" for="radioSelect2">
                                No
                            </label>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center my-2">
                        <button type="submit" class="btn-style rounded ${textStyle}">Decision</button>
                    </div>
                </form>
            </div>        
        `;
        return confirmCon;
    }
    //backとnextの２つのボタンを作成する関数
    static backNextBtn(backString, nextString, classListString){
        let container = document.createElement("div");
        container.innerHTML = `
        <div class="${classListString}">
            <button type="button" class="back btn-style rounded small-text">${backString}</button>
            <button type="submit" class="next btn-style rounded small-text">${nextString}</button>
        </div>
        `;
        return container;
    }
}
//初めに、SetiingPageを表示させてタイトル画面を表示する
Control.displayBlock(Config.SettingPage);
Control.updatePageContent(Config.SettingPage, View.titleCon("Clicker Empire Game", "large-text", "https://github.com/khkmgch/Clicker_Empire_Game/blob/main/images/SodaPDF-converted-hamburger.png?raw=true", "small-text"));
