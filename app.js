import ITEMS from './variables/items.js';

class Item {
  constructor(name, type, price, income, interests, maxNumPossession, description, src) {
    this.name = name;
    this.type = type;
    this.price = price;
    this.income = income;
    this.interests = interests;
    this.maxNumPossession = maxNumPossession;
    this.description = description;
    this.src = `assets/${src}`;
    this.numOwned = 0;
    this.cumulativePurchaseAmountStock = 0;
  }

  getTotalPrice(quantity) {
    return this.price * quantity;
  }

  isReachMaxNumPossession(quantity) {
    return this.numOwned + quantity > this.maxNumPossession;
  }

  calculateIncome(quantity) {
    return this.income * quantity;
  }

  calculateProfit(quantity) {
    // 「株式」を購入する場合、価格の増加分を考慮して、累計購入額を更新する必要がある
    if (this.name === '株式') {
      const profit = Math.floor((this.getTotalPrice(quantity) + this.cumulativePurchaseAmountStock) * this.interests);
      this.cumulativePurchaseAmountStock += this.getTotalPrice(quantity);
      this.increaseStockPrice();
      return profit;
    }
    // 「債券」を購入する場合は、価格が変化しないため、累計購入額は価格と累計購入数の積で単純に求められる
    return Math.floor((this.getTotalPrice(quantity) + this.numOwned * this.price) * this.interests);
  }

  increaseStockPrice() {
    this.price += Math.floor(this.price / 10);
    redraw('株式PriceTxt', `価格 ${this.price.toLocaleString()} 円`);
  }

  bePurchased(quantity) {
    this.numOwned += quantity;
    redraw('numOwnedTxt', `${this.numOwned} / ${this.maxNumPossession} 個`);
  }
}
class Player {
  constructor(username) {
    this.username = username;
    this.age = 20;
    this.totalMoney = 50000;
    this.incomePerSecond = 0;
    this.incomePerClick = 25;
    this.totalClickCount = 0;
    this.daysElapsed = 0;
  }

  clickBurger() {
    this.totalClickCount++;
    redraw('totalClickCountTxt', `ハンバーガー ${this.totalClickCount} 個`);
    this.earn('click');
  }

  spendDay() {
    this.daysElapsed++;
    if (this.daysElapsed % 30 === 0) this.getOld();
    this.earn('second');
    redraw('daysElapsedTxt', `${this.daysElapsed} 日経過`);
  }

  getOld() {
    this.age++;
    redraw('ageTxt', `${this.age} 歳`);
  }

  earn(type) {
    this.totalMoney += type === 'click' ? this.incomePerClick : type === 'second' ? this.incomePerSecond : 0;
    redraw('totalMoneyTxt', `所持金 ${this.totalMoney.toLocaleString()} 円`);
  }

  pay(amount) {
    this.totalMoney -= amount;
    redraw('totalMoneyTxt', `所持金 ${this.totalMoney.toLocaleString()} 円`);
  }

  purchase(Item, quantity) {
    const moneyRequired = Item.price * quantity;
    //  所持金が不足している場合
    if (this.totalMoney < moneyRequired) alert('所持金が不足しています。');
    // 所持上限数に達している場合
    else if (Item.isReachMaxNumPossession(quantity)) alert('所持上限数に達しています。');
    // 購入できる場合
    else {
      switch (Item.type) {
        case '能力': this.incomePerClick += Item.calculateIncome(quantity); break;
        case '固定資産': this.incomePerSecond += Item.calculateIncome(quantity); break;
        case '投資': this.incomePerSecond += Item.calculateProfit(quantity); break;
        default:
          break;
      }
      this.pay(moneyRequired); // 所持金を減少させる
      Item.bePurchased(quantity); // アイテムインスタンスの被所持数の値を増加させる
      redraw('incomePerClickTxt', `1個あたり ${this.incomePerClick.toLocaleString()} 円獲得`);
      redraw('incomePerSecondTxt', `1秒あたり ${this.incomePerSecond.toLocaleString()} 円獲得`);
    }
  }
}


// <----------------ここから---------------->
const startPage = generateStartPage('gray');
render(startPage);

// 根ノードに受け取ったdomをappendする関数
function render(page) {
  const app = document.getElementById('root');
  app.innerHTML = '';
  app.append(page);
}

// 受け取ったidをもつノードの内部HTMLを、受け取ったvalueで更新する関数
function redraw(id, value) {
  document.getElementById(id).innerHTML = value;
}

// 最初のページを生成する関数
function generateStartPage(bgColor) {
  const container = document.createElement('div');
  container.id = 'startPage';
  container.classList.add('w-full', 'h-full', 'flex', 'flex-col', 'justify-center', 'items-center', `bg-${bgColor}-400`);

  const appTitle = document.createElement('p');
  appTitle.innerHTML = 'Clicker Empire Game';
  appTitle.classList.add('font-bold', 'text-3xl');

  const subTitle = document.createElement('p');
  subTitle.innerHTML = 'あなたはファストフード店で働く 20 歳の青年で、毎日ハンバーガーをひっくり返すごとに 25 円を稼いでいます。<br>お金を貯めて投資や資産を購入し、億万長者を目指しましょう！';
  subTitle.classList.add('mt-10', 'mb-2', 'font-bold', 'text-center');

  const usernameInput = document.createElement('input');
  usernameInput.id = 'targetForGettingUsername';
  usernameInput.placeholder = 'ユーザー名';
  usernameInput.classList.add('py-3', 'px-5', 'mt-5', 'text-center');

  const startBtn = document.createElement('button');
  startBtn.innerHTML = 'start';
  startBtn.classList.add('py-3', 'px-5', 'mt-5', `bg-${bgColor}-500`, 'text-white', 'text-xl', 'rounded-3xl');
  startBtn.addEventListener('click', () => {
    if (usernameInput.value.length === 0) alert('ユーザー名を入力してください');
    else {
      const inputUsername = document.getElementById('targetForGettingUsername').value;
      const player = new Player(inputUsername);
      const nextPage = generateMainPage(player, bgColor);
      render(nextPage);
    }
  });

  container.append(appTitle, subTitle, usernameInput, startBtn);
  return container;
}

// ゲーム画面を生成する関数
function generateMainPage(Player, bgColor) {
  const container = document.createElement('div');
  container.classList.add('w-full', 'h-full', 'p-4', 'grid', 'grid-flow-col', 'grid-rows-6', 'grid-cols-7', 'gap-4', `bg-${bgColor}-400`);

  const burgerCon = generateBurgerContainer(); // ハンバーガークリック画面
  const profileCon = generateProfileContainer(); // ユーザープロフィール画面
  const shopCon = generateShopContainer(); // アイテム購入画面

  container.append(burgerCon, profileCon, shopCon);
  return container;

  // ハンバーガークリック画面を生成する関数
  function generateBurgerContainer() {
    const container = document.createElement('div');
    container.classList.add('row-span-6', 'col-span-3', 'w-full', 'flex', 'flex-col', 'items-center', `bg-${bgColor}-500`);

    const subContainer = document.createElement('div');
    subContainer.classList.add('w-4/5', 'mt-12', 'p-2', 'flex', 'flex-col', 'justify-around', 'items-center', 'font-bold', `bg-${bgColor}-400`);

    const totalClickCountTxt = document.createElement('p');
    totalClickCountTxt.id = 'totalClickCountTxt';
    totalClickCountTxt.innerHTML = `ハンバーガー ${Player.totalClickCount} 個`;
    totalClickCountTxt.classList.add('mb-1', 'text-2xl');

    const incomePerClickTxt = document.createElement('p');
    incomePerClickTxt.id = 'incomePerClickTxt';
    incomePerClickTxt.innerHTML = `1個あたり ${Player.incomePerClick} 円獲得`;
    incomePerClickTxt.classList.add('text-xl');

    const incomePerSecondTxt = document.createElement('p');
    incomePerSecondTxt.id = 'incomePerSecondTxt';
    incomePerSecondTxt.innerHTML = `1秒あたり ${Player.incomePerSecond} 円獲得`;
    incomePerSecondTxt.classList.add('text-xl');

    const explainTxt = document.createElement('p');
    explainTxt.innerHTML = 'Click here!';
    explainTxt.classList.add('mt-20', 'font-bold', 'text-center', 'text-gray-200');

    const burgerImg = document.createElement('img');
    burgerImg.src = 'assets/burger.png';
    burgerImg.classList.add('w-4/5', 'mt-4', 'cursor-pointer', 'select-none', 'transform');
    burgerImg.addEventListener('click', () => {
      Player.clickBurger();
    });

    subContainer.append(totalClickCountTxt, incomePerClickTxt, incomePerSecondTxt);
    container.append(subContainer, explainTxt, burgerImg);
    return container;
  }

  // ユーザープロフィール画面を生成する関数
  function generateProfileContainer() {
    const container = document.createElement('div');
    container.classList.add('row-span-1', 'col-span-4', 'w-full', 'p-2', 'grid', 'grid-rows-2', 'grid-cols-2', 'gap-2', 'flex', 'justify-center', 'items-center', `bg-${bgColor}-500`);

    const usernameTxt = document.createElement('p');
    usernameTxt.innerHTML = Player.username;
    usernameTxt.id = 'usernameTxt';
    usernameTxt.classList.add('w-full', 'h-full', 'row-span-1', 'col-span-1', 'flex', 'justify-center', 'items-center', `bg-${bgColor}-400`);

    const ageTxt = usernameTxt.cloneNode(true);
    ageTxt.id = 'ageTxt';
    ageTxt.innerHTML = `${Player.age} 歳`;

    const daysElapsedTxt = usernameTxt.cloneNode(true);
    daysElapsedTxt.id = 'daysElapsedTxt';
    daysElapsedTxt.innerHTML = `${Player.daysElapsed} 日経過`;
    // １秒経過ごとに収入を獲得し、daysElapsedTxtを更新する。
    setInterval(() => {
      Player.spendDay();
    }, 1000);

    const totalMoneyTxt = usernameTxt.cloneNode(true);
    totalMoneyTxt.id = 'totalMoneyTxt';
    totalMoneyTxt.innerHTML = `所持金 ${Player.totalMoney.toLocaleString()} 円`;

    container.append(usernameTxt, ageTxt, daysElapsedTxt, totalMoneyTxt);
    return container;
  }

  // アイテム購入画面を生成する関数
  function generateShopContainer() {
    const container = document.createElement('div');
    container.id = 'shopArea';
    container.classList.add('row-span-5', 'col-span-4', 'w-full', 'p-2', `bg-${bgColor}-500`, 'relative', 'overflow-hidden');

    const scrollContainer = document.createElement('div');
    scrollContainer.classList.add('w-full', 'h-full', 'overflow-y-scroll', 'flex', 'flex-col');
    ITEMS.map((item) => (
      scrollContainer.append(
        generateShopItemComponent( // アイテム情報画面を配列から生成
          new Item(
            item.name,
            item.type,
            item.price,
            item.income,
            item.interests,
            item.maxNumPossession,
            item.description,
            item.src,
          ),
        ),
      )
    ));

    const detailComponent = document.createElement('div');
    detailComponent.id = 'detailComponent';
    detailComponent.classList.add('w-full', 'h-2/5', 'left-0', 'transition-all', 'absolute', `bg-${bgColor}-400`, 'border-8', `border-${bgColor}-500`);
    detailComponent.style.top = '100%';
    container.append(scrollContainer, detailComponent);
    return container;

    // アイテム情報画面を生成する関数
    function generateShopItemComponent(Item) {
      const component = document.createElement('div');
      component.classList.add('mb-2', 'flex', 'justify-start', 'transition', `bg-${bgColor}-400`, 'cursor-pointer');

      const textBx = document.createElement('div');
      textBx.classList.add('ml-4', 'flex', 'flex-col', 'justify-center', 'items-start');

      const image = document.createElement('img');
      image.src = Item.src;
      image.classList.add('w-28', 'h-24', 'left-0');

      const nameTxt = document.createElement('p');
      nameTxt.innerHTML = Item.name;
      nameTxt.classList.add('font-bold');

      const priceTxt = nameTxt.cloneNode(true);
      priceTxt.id = `${Item.name}PriceTxt`;
      priceTxt.innerHTML = `価格 ${Item.price.toLocaleString()} 円`;

      const descriptionTxt = nameTxt.cloneNode(true);
      descriptionTxt.innerHTML = Item.description;

      textBx.append(nameTxt, priceTxt, descriptionTxt);
      component.append(image, textBx);
      component.addEventListener('click', () => {
        detailComponent.innerHTML = '';
        detailComponent.append(generateShopItemDetailComponent(Item)); // アイテム購入画面
        const target = document.getElementById('detailComponent');
        target.style.top = '60%';
      });
      return component;
    }
    // アイテム購入画面を生成する関数
    function generateShopItemDetailComponent(Item) {
      const component = document.createElement('div');
      component.classList.add('p-2', 'w-full', 'h-full', 'flex', 'justify-around', 'items-center', 'relative');

      const angleDownBtn = document.createElement('i');
      angleDownBtn.classList.add('fas', 'fa-angle-double-down', 'absolute', 'top-2', 'left-2', 'text-gray-600', 'text-3xl', 'cursor-pointer');
      angleDownBtn.addEventListener('click', () => {
        const target = document.getElementById('detailComponent');
        target.style.top = '100%';
      });

      const imageBx = document.createElement('div');
      imageBx.classList.add('w-2/5', 'flex', 'items-center', 'justify-center');

      const image = document.createElement('img');
      image.src = Item.src;
      image.classList.add('w-36', 'h-32');

      const subBx = document.createElement('div');
      subBx.classList.add('w-3/5', 'flex', 'flex-col', 'items-start');

      const nameTxt = document.createElement('p');
      nameTxt.innerHTML = Item.name;
      nameTxt.classList.add('font-bold');

      const numOwnedTxt = document.createElement('p');
      numOwnedTxt.id = 'numOwnedTxt';
      numOwnedTxt.innerHTML = `${Item.numOwned} / ${Item.maxNumPossession} 個`;
      numOwnedTxt.classList.add('font-medium');

      const askNumTxt = document.createElement('p');
      askNumTxt.innerHTML = 'いくつ購入しますか？';

      const inputNumPurchase = document.createElement('input');
      inputNumPurchase.id = 'inputNumPurchase';
      inputNumPurchase.value = 1;
      inputNumPurchase.type = 'number';
      inputNumPurchase.classList.add('p-1', 'w-1/2', 'text-right', `bg-${bgColor}-100`, 'text-lg');
      // inputのvalueが更新されるたびに、価格と掛け合わせた合計金額が更新される
      inputNumPurchase.addEventListener('change', () => {
        const inputNum = parseInt(document.getElementById('inputNumPurchase').value);
        document.getElementById('totalPriceTxt').innerHTML = `合計 ${Item.getTotalPrice(inputNum).toLocaleString()} 円`;
      });

      const totalPriceTxt = document.createElement('p');
      totalPriceTxt.id = 'totalPriceTxt';
      totalPriceTxt.innerHTML = `合計 ${Item.getTotalPrice(1).toLocaleString()} 円`;
      totalPriceTxt.classList.add('font-bold');

      const purchaseBtn = document.createElement('button');
      purchaseBtn.innerHTML = '購入';
      purchaseBtn.classList.add('absolute', 'bottom-2', 'right-2', 'px-2', 'py-1', 'text-white', 'font-medium', `bg-${bgColor}-500`);
      // 購入ボタンが押されると、Player.purchase()を呼び出す
      purchaseBtn.addEventListener('click', () => {
        const inputNum = parseInt(document.getElementById('inputNumPurchase').value);
        Player.purchase(Item, inputNum);
      });

      imageBx.append(image);
      subBx.append(nameTxt, numOwnedTxt, askNumTxt, inputNumPurchase, totalPriceTxt, purchaseBtn);
      component.append(angleDownBtn, imageBx, subBx);
      return component;
    }
  }
}
