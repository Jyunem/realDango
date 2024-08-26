import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, setDoc, doc, serverTimestamp, onSnapshot, deleteDoc, orderBy, updateDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDS7P-4N2Da5Jm7yn7zRRARx14N5_gnlys",
    authDomain: "dango-ai.firebaseapp.com",
    projectId: "dango-ai",
    storageBucket: "dango-ai.appspot.com",
    messagingSenderId: "1059269700080",
    appId: "1:1059269700080:web:01feb8e59dc2fc1c239535",
    measurementId: "G-BMGQ62Z9YF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth();
let uid = localStorage.getItem('uid');
const provider = new GoogleAuthProvider();

//요소 정의
const App = document.querySelector('.app');

const toggle = document.getElementById('wordbook');

const subArea = document.querySelector('.sub-area');
const mainArea = document.querySelector('.main-area');

const donate = document.querySelector('.donate');
const support = document.querySelector('.support');
const logout = document.querySelector('.logout');
const help = document.querySelector('.help');


const translateButton = document.getElementById('translate');
translateButton.addEventListener('click', Translate);
const translateIcon = document.getElementById('translate-icon');
const loadingIcon = document.getElementById('loading-icon');

const kakaoAd = document.querySelector('.kakao-ad');

const wordInput = document.querySelector('.word-input');


//영역 만드는 함수 만드려 했는데,, 잠시 보류

// function createArea(name,where,btns = []) {
//     const btn_elements = [];

//     name = document.createElement('div');
//     name.classList.add('name-area');
//     where.appendChild(name);

//     const content_area = document.createElement('div');
//     content_area.classList.add('content-area');
//     name.appendChild(content_area);

//     const btn_area = document.createElement('div');
//     btn_area.classList.add('btn-area');

//     for (const btn of btns) {
//         const btn = document.createElement('button');
//         btn_area.appendChild(btn);
//         btn_elements.push(btn);
//     }

//     name.appendChild(btn_area);
//     return btn_elements;
// }


const currentDate = new Date();

const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1;
const day = currentDate.getDate();
const hours = currentDate.getHours();
const minutes = currentDate.getMinutes();

const date = `${year}. ${month}. ${day}`;
const defaultListName = `${year}. ${month}. ${day}. ${hours}:${minutes}`;

let results = [];
let subResults = [];

//wordbook

let isloggin = false;
let isCheckingUser = true;

if (uid) {
    isloggin = true;
    isCheckingUser = false;
} else {
    isloggin = false;
    isCheckingUser = false;
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        isloggin = true;
        uid = user.uid; // 여기서 uid 값을 할당
        localStorage.setItem('uid', uid);
        console.log('user loggin');
        isCheckingUser = false;
    } else {
        isloggin = false;
        console.log('user not loggin');
        localStorage.removeItem('uid');
        isCheckingUser = false;
    }
});

logout.addEventListener('click', () => {
    const result = confirm('로그아웃 하시겠습니까?');
    if (result) {
        signOut(auth).then(() => {
            // Sign-out successful.   
            localStorage.removeItem('uid');
            alert('로그아웃 되었습니다');
            toggle.checked = false;
            toggleChanged()
        }).catch((error) => {
            // An error happened.
        })
    } else {
        // 사용자가 Cancel을 클릭한 경우
    }
});

const wordList = document.createElement('div');
wordList.classList.add('word-list');
subArea.appendChild(wordList);

let isListOpen = false; // 리스트 상태를 추적하는 플래그

const q = query(collection(db, "word"), where("uid", "==", uid), orderBy("uid"), orderBy("timestamp", "desc"));
// const unsubscribe = /* unsubscribe(); << 실시간 변동 멈출 수 있음 */
onSnapshot(q, (querySnapshot) => {
    wordList.textContent = '';
    querySnapshot.forEach((docs) => {

        const listContainer = document.createElement('div');
        listContainer.classList.add('list-container');
        listContainer.dataset.results = JSON.stringify(docs.data().results);

        const updateDay = document.createElement('span');
        updateDay.textContent = docs.data().date;
        updateDay.style.color = '#dcdcdc';

        const listNameElement = document.createElement('span');
        listNameElement.textContent = docs.data().listName;

        listContainer.appendChild(updateDay);
        listContainer.appendChild(listNameElement);

        listContainer.addEventListener('click', async () => {
            if (!isListOpen) {
                kakaoAd.style.display = 'none';

                const allListContainers = document.querySelectorAll('.list-container');
                allListContainers.forEach((container) => {
                    container.style.color = ''; // 기본 색상으로 초기화
                });

                // 클릭된 listContainer의 글자 색을 변경
                listContainer.style.color = '#007bffce';
                listContainer.scrollIntoView({ behavior: 'smooth' });

                const isWordbookArea = document.querySelector('.name-area');
                if (isWordbookArea) {
                    isWordbookArea.remove();
                }

                const isMoreBtn = document.querySelector('.moreBtnArea');
                if (isMoreBtn) {
                    isMoreBtn.remove();
                }

                results = docs.data().results;

                const wordbookArea = document.createElement('div');
                wordbookArea.classList.add('name-area');
                wordbookArea.classList.add('a');
                subArea.appendChild(wordbookArea);

                const contentArea = document.createElement('div');
                contentArea.classList.add('content-area');
                wordbookArea.appendChild(contentArea);
                showWord(results, contentArea);

                const btnArea = document.createElement('div');
                btnArea.classList.add('btn-area');
                wordbookArea.appendChild(btnArea);

                const leaning_ch_Button = document.createElement('button');
                leaning_ch_Button
                leaning_ch_Button.addEventListener('click', () => {
                    toggle.checked = false;
                    toggleChanged();
                    learning_ch(results);
                });
                btnArea.appendChild(leaning_ch_Button);

                const leaning_ch_img = document.createElement('img');
                leaning_ch_img.src = 'svg/learning.svg';
                leaning_ch_Button.appendChild(leaning_ch_img);

                const p1 = document.createElement('p');
                p1.textContent = '학습';
                leaning_ch_Button.appendChild(p1);


                const test_ch_Button = document.createElement('button');
                test_ch_Button.addEventListener('click', () => {
                    toggle.checked = false;
                    toggleChanged();
                    Test_ch(results);
                });
                btnArea.appendChild(test_ch_Button);

                const test_ch_img = document.createElement('img');
                test_ch_img.src = 'svg/test.svg';
                test_ch_Button.appendChild(test_ch_img);

                const p2 = document.createElement('p');
                p2.textContent = '테스트';
                test_ch_Button.appendChild(p2);

                const test_tone_Button = document.createElement('button');
                test_tone_Button.addEventListener('click', () => {
                    toggle.checked = false;
                    toggleChanged();
                    test_tone();
                });
                btnArea.appendChild(test_tone_Button);


                const test_tone_img = document.createElement('img');
                test_tone_img.src = 'svg/listening.svg';
                test_tone_Button.appendChild(test_tone_img);

                const p3 = document.createElement('p');
                p3.textContent = '듣기';
                test_tone_Button.appendChild(p3);

                const wordbook_Button = document.createElement('button');
                wordbook_Button.addEventListener('click', () => {
                    toggle.checked = false;
                    toggleChanged();
                    kakaoAd.style.display = 'none';
                    mainArea.innerHTML = '';

                    const listName = document.createElement('input');
                    listName.classList.add('list-name');
                    listName.value = docs.data().listName;

                    const wordbook_area = document.createElement('div');
                    wordbook_area.classList.add('name-area');

                    mainArea.appendChild(listName);
                    mainArea.appendChild(wordbook_area);

                    const content_area = document.createElement('div');
                    content_area.classList.add('content-area');
                    wordbook_area.appendChild(content_area);
                    showWord(results, content_area);

                    const btn_area = document.createElement('div');
                    btn_area.classList.add('btn-area');
                    btn_area.style.flexDirection = 'column';
                    btn_area.style.backgroundColor = '#ccc';
                    wordbook_area.appendChild(btn_area);

                    let updatedName = docs.data().listName;

                    const update_btn = document.createElement('button');
                    update_btn.textContent = '변경사항 저장하기'
                    update_btn.addEventListener('click', async () => {
                        const docRef = doc(db, "word", docs.id); // 업데이트할 문서에 대한 참조
                        const updateData = {
                            results,
                            timestamp: serverTimestamp(),
                            date: date,
                            listName: updatedName
                        }; // 업데이트할 데이터 객체
                        await updateDoc(docRef, updateData); // 문서 업데이트
                        console.log(results);
                        console.log('updated words');
                        btn_area.style.backgroundColor = '#ccc';
                        update_btn.disabled = true;
                    })
                    update_btn.disabled = true;
                    btn_area.appendChild(update_btn);

                    listName.addEventListener('input', (e) => {
                        updatedName = e.target.value;
                        btn_area.style.transition = '0.4s';
                        btn_area.style.backgroundColor = '#007bffce';
                        update_btn.disabled = false;
                    });

                    const meaningInput = document.querySelectorAll('.meaning-input');
                    meaningInput.forEach(input => {
                        input.addEventListener('input', () => {
                            results = results;
                            btn_area.style.transition = '0.4s';
                            btn_area.style.backgroundColor = '#007bffce';
                            update_btn.disabled = false;
                        });
                    });

                });
                btnArea.appendChild(wordbook_Button);

                const wordbook_img = document.createElement('img');
                wordbook_img.src = 'svg/wordbook.svg';
                wordbook_Button.appendChild(wordbook_img);

                const p4 = document.createElement('p');
                p4.textContent = '단어장';
                wordbook_Button.appendChild(p4);

                listContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });

        const deleteButton = document.createElement('img');
        deleteButton.src = 'svg/delete.svg'
        deleteButton.classList.add('delete-button');
        listContainer.appendChild(deleteButton);

        deleteButton.addEventListener('click', () => {
            setTimeout(() => {
                const isWordbookArea = document.querySelector('.name-area');
                listContainer.classList.add('fade-out');
                setTimeout(() => {
                    isWordbookArea.remove();
                }, 50);

                listContainer.classList.add('fade-out');
                listContainer.addEventListener('transitionend', () => {
                    listContainer.remove();
                    deleteDoc(doc(db, "word", docs.id));
                }, { once: true });
            }, 50);
        });


        wordList.appendChild(listContainer);
    })
});

function create_more_btn() {
    const moreBtnArea = document.createElement('div');
    moreBtnArea.classList.add('moreBtnArea');

    const mutiTest = document.createElement('button');
    mutiTest.textContent = '테스트';
    mutiTest.classList.add('close_btn');
    mutiTest.addEventListener('click', () => {

        const checkedCheckboxes = document.querySelectorAll('.list-container input[type="checkbox"]:checked');
        const results = Array.from(checkedCheckboxes).reduce((acc, checkbox) => {
            const checkboxResults = JSON.parse(checkbox.dataset.results);
            checkboxResults.forEach(item => {
                // chineseWord를 기준으로 중복 확인
                if (!acc.some(accItem => accItem.chineseWord === item.chineseWord)) {
                    acc.push(item);
                }
            });
            return acc;
        }, []);


        // 중복이 제거된 results 배열 사용

        toggle.checked = false;
        toggleChanged();
        Test_ch(results);
    });


    moreBtnArea.appendChild(mutiTest);

    const moreBtn_img = document.createElement('img');
    moreBtn_img.classList.add('moreBtn_img');
    moreBtn_img.src = 'svg/more.svg';

    moreBtn_img.addEventListener('click', () => {
        if (isListOpen) {
            // Close action
            moreBtnArea.classList.remove('open');
            moreBtnArea.classList.add('close');
            moreBtn_img.classList.remove('open_img');
            moreBtn_img.classList.add('close_img');

            mutiTest.classList.remove('open_btn');
            mutiTest.classList.add('close_btn');
            mutiTest.disabled = true;

            // Replace checkboxes with updateDay
            const listContainers = document.querySelectorAll('.list-container');
            listContainers.forEach(container => {
                const checkbox = container.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    const updateDay = document.createElement('span');
                    updateDay.textContent = checkbox.dataset.updateDay;
                    updateDay.style.color = '#dcdcdc';

                    container.replaceChild(updateDay, checkbox);
                }
            });

        } else {
            // Open action
            moreBtnArea.classList.remove('close');
            moreBtnArea.classList.add('open');
            moreBtn_img.classList.remove('close_img');
            moreBtn_img.classList.add('open_img');

            mutiTest.classList.remove('close_btn');
            mutiTest.classList.add('open_btn');
            mutiTest.disabled = false;


            // Replace updateDay with checkboxes
            const listContainers = document.querySelectorAll('.list-container');
            listContainers.forEach(container => {
                const updateDay = container.querySelector('span');
                if (updateDay) {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.dataset.results = container.dataset.results; // 결과 데이터 저장

                    container.replaceChild(checkbox, updateDay);
                }
            });
        }
        isListOpen = !isListOpen;
    });

    moreBtnArea.appendChild(moreBtn_img);

    subArea.appendChild(moreBtnArea);
}
create_more_btn();

kakaoAd.classList.add('b');
async function toggleChanged() {
    if (isCheckingUser) {
        alert('로그인 정보 확인 중입니다. 다시 시도하세요.');
        toggle.checked = false;
        return;
    }

    toggle.disabled = true;
    setTimeout(() => {
        toggle.disabled = false;
    }, 300);

    //? 여기가 작동을 안하는데,, 시발 뭐임
    if (toggle.checked) {
        if (isloggin == false) {
            alert('로그인 후 이용 가능합니다. \n *로그인 창이 표시되지 않을시, 팝업 차단을 해제후 다시 시도하세요*');
            signInWithPopup(auth, provider)
                .then((result) => {
                    window.location.href = "index.html";
                }).catch((error) => {
                    alert(error);
                });
        }

        const isWordbookArea = document.querySelector('.name-area.a');
        if (isWordbookArea) {
            isWordbookArea.remove();
        }
        const isMoreBtn = document.querySelector('.moreBtnArea');
        if (!isMoreBtn) {
            create_more_btn();
        }

        const wordList = document.querySelector('.word-list');
        wordList.style.display = 'block';

        mainArea.classList.add('c');
        setTimeout(() => {
            mainArea.style.display = 'none';
            subArea.style.display = 'flex';
            kakaoAd.style.display = 'flex';

            setTimeout(() => {
                subArea.classList.add('b');
                kakaoAd.classList.add('b');
            }, 50);
        }, 30);

        logout.style.display = 'flex';
        support.style.display = 'none';
        donate.style.display = 'flex';
        help.style.display = 'none';


    } else {
        subArea.classList.remove('b');
        kakaoAd.classList.remove('b');
        setTimeout(() => {
            subArea.style.display = 'none';
            kakaoAd.style.display = 'none';
            mainArea.style.display = 'flex';

            setTimeout(() => {
                mainArea.classList.remove('c');
            }, 70);
        }, 50);

        logout.style.display = 'none';
        support.style.display = 'flex';
        donate.style.display = 'none';
        help.style.display = 'flex';
    }
}
toggle.addEventListener('change', toggleChanged);

//

const callChatGPT = async (messages, parameters = {}) => {
    try {
      const response = await fetch('http://localhost:5001/dango-ai/us-central1/chatGPT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, parameters }),
      });
      const data = await response.json();
      if (response.ok) {
        return data.message;
      } else {
        throw new Error(data);
      }
    } catch (error) {
      console.error('Error calling chatGPT function:', error);
    }
  };
  
  // 예시 사용법
  login().then(() => {
    callChatGPT([['user', 'Hello, how are you?']])
      .then(response => console.log(response))
      .catch(error => console.error('Error:', error));
  });

  
// const callChatGPT = async (messages, parameters = {}) => {
//     try {
//       const response = await fetch('https://us-central1-dango-ai.cloudfunctions.net/chatGPT', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ messages, parameters }),
//       });
//       const data = await response.json();
//       if (response.ok) {
//         return data.message;
//       } else {
//         throw new Error(data);
//       }
//     } catch (error) {
//       console.error('Error calling chatGPT function:', error);
//     }
//   };

  
// const chatGPT = async (messages, parameters = {}) => {
//     const apikey = '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';
//     if (messages[0].constructor === String) return await chatGPT([['user', messages[0]]]);
//     messages = messages.map(line => ({ role: line[0], content: line[1].trim() }))
//     console.log('using chatGPT')
//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apikey}` },
//         body: JSON.stringify({ model: 'gpt-3.5-turbo', messages, ...parameters }),
//     });
//     const data = await response.json();
//     if (data?.error?.message) throw new Error(data.error.message);
//     return data.choices[0].message.content.trim();
// };

async function Translate() {
    toggle.disabled = true;
    var wordInputVal = document.getElementById('word-input').value;
    if (!wordInputVal) {
        const translateIcon = document.getElementById('translate-icon');
        translateIcon.classList.add('denied-animation');
        setTimeout(() => {
            translateIcon.classList.remove('denied-animation');
        }, 1000);
        return;
    }

    translateButton.disabled = true;
    translateIcon.style.display = 'none';
    loadingIcon.style.display = 'inline-block';

    // Add "DESC::" prefix to wordInput
    wordInputVal = `DESC::${wordInputVal}`
    const localResults = [];
    // Get translation results as JSON using prompt engineering
    let response;
    try {
        response = await callChatGPT([
            ['system', ` The assistant's job is to translate the Chinese word list into Korean using a Papago translator and print out the Chinese tone for each word. Returns only the JSON array. Removes pre-text and post-text. When a user inputs a word in Korean (or a language other than Chinese), find the corresponding Chinese word and output it as a JSON array.When a user inputs a sentence, extract all components of the sentence thoroughly to aid in learning.`],
            ['user', 'DESC::金杯'],
            ['assistant', '[{"Chinese word":"金杯","meaning":"금잔","tone":"jīn bēi"}]'],
            ['user', 'DESC::制'],
            ['assistant', '[{"Chinese word":"制","meaning":"제작하다","tone":"zhì"}]'],
            ['user', 'DESC::差别'],
            ['assistant', '[{"Chinese word":"差别","meaning":"차이","tone":"chā bié"}]'],
            ['user', 'DESC::연필'],
            ['assistant', '[{"Chinese word":"铅笔","meaning":"연필","tone":"qiānbǐ"}]'],
            ['user', 'DESC::예쁘다'],
            ['assistant', '[{"Chinese word":"漂亮","meaning":"예쁘다","tone":"piàoliang"}]'],
            ['user', 'DESC::세수하다'],
            ['assistant', '[{"Chinese word":"铅笔","meaning":"세수하다","tone":"xi liǎn"}]'],
            ['user', 'DESC::너의 방안에 창문이 활짝 열려 있어서 매우 춥다.'],
            ['assistant', '[{"Chinese word":"你","meaning":"너","tone":"nǐ"}]',
                '[{"Chinese word":"的","meaning":"~의","tone":"de"}]',
                '[{"Chinese word":"房间","meaning":"방","tone":"fángjiān"}]',
                '[{"Chinese word":"窗户","meaning":"창문","tone":"chuānghù"}]',
                '[{"Chinese word":"大开","meaning":"크게 열다","tone":"dà kāi"}]',
                '[{"Chinese word":"非常","meaning":"매우","tone":"fēicháng"}]',
                '[{"Chinese word":"冷","meaning":"춥다","tone":"lěng."}]'],
            ['user', 'DESC::어떤 노자가 말하길, 작은것에 눈이 멀어 큰것을 잃는 순간을 조심하라 라고 말했다.'],
            ['assistant', '[{"Chinese word":"一些","meaning":"어떤","tone":"yīxiē"}]',
                '[{"Chinese word":"老子","meaning":"노자","tone":"lǎozi"}]',
                '[{"Chinese word":"说","meaning":"말하다","tone":"shuō"}]',
                '[{"Chinese word":"‘小","meaning":"작은","tone":"xiǎo"}]',
                '[{"Chinese word":"东西","meaning":"것에","tone":"dōngxi"}]',
                '[{"Chinese word":"盲","meaning":"눈이 멀어","tone":"máng"}]',
                '[{"Chinese word":"失去","meaning":"잃다","tone":"shīqù"}]',
                '[{"Chinese word":"时刻","meaning":"순간","tone":"shíkè"}]',
                '[{"Chinese word":"小心","meaning":"조심하다","tone":"xiǎoxīn"}]',
                '[{"Chinese word":"他","meaning":"그","tone":"tā"}]',
                '[{"Chinese word":"说","meaning":"말했다","tone":"shuō"}]'],
            ['user', wordInputVal],
        ], { temperature: 0.0 });
        // Parse the response JSON
        const resultArray = JSON.parse(response);
        for (const result of resultArray) {
            const chineseWord = result['Chinese word'];
            const meaning = result['meaning'];
            const tone = result['tone'];
            results.push({ chineseWord, meaning, tone });
        }
        console.log(response);
        console.log(results);

        translateButton.disabled = false;
        loadingIcon.style.display = 'none';

        wordInput.style.display = 'none';

    } catch (e) {
        console.log(e.message);
        alert("오류가 발생했습니다. 올바른 중국어 단어를 입력해주세요.");
        window.location.href = "index.html";
    }
    subResults = results;
    leaning(results);
}

function leaning(results) {
    toggle.disabled = true;

    const learning_area = document.createElement('div');
    learning_area.classList.add('name-area');
    mainArea.appendChild(learning_area);

    const content_area = document.createElement('div');
    content_area.classList.add('content-area');
    learning_area.appendChild(content_area);

    const btn_area = document.createElement('div');
    btn_area.classList.add('btn-area');
    learning_area.appendChild(btn_area);

    showWord(subResults, content_area);

    const learning_ch_Button = document.createElement('button');
    learning_ch_Button.addEventListener('click', async () => {
        mainArea.textContent = '';
        learning_ch(subResults);

        if (isloggin == true) {
            // let uid = localStorage.getItem('uid');

            await setDoc(doc(db, "word", `${uid} + ${new Date()}`), {
                uid: uid,
                results,
                timestamp: serverTimestamp(),
                date: date,
                listName: defaultListName
            });
            console.log('saved words');
        }

        toggle.disabled = false;
    });
    btn_area.appendChild(learning_ch_Button);

    const leaning_ch_img = document.createElement('img');
    leaning_ch_img.src = 'svg/learning.svg';
    learning_ch_Button.appendChild(leaning_ch_img);

    const p = document.createElement('p');
    p.textContent = '중국어 학습';
    learning_ch_Button.appendChild(p);
}

function showWord(subResults, selectArea) {
    const area = selectArea

    const wordArea = document.createElement('div');
    wordArea.classList.add('word-area');
    area.appendChild(wordArea);
    //여기까진 성공이네, 내가 원하는 위치에 출력 가능함.

    for (let i = 0; i < subResults.length; i++) {
        const result = subResults[i];

        const wordContainer = document.createElement('div');
        wordContainer.classList.add('word-container');

        const word = document.createElement('div');
        word.classList.add('word');
        word.addEventListener('click', () => {
            const speechSynthesis = window.speechSynthesis;
            speechSynthesis.cancel(); // 현재 음성 중단
            const utterance = new SpeechSynthesisUtterance(result.chineseWord);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        });

        const chineseWord = document.createElement('div');
        chineseWord.classList.add('chinese-word');
        chineseWord.textContent = result.chineseWord;
        word.appendChild(chineseWord);

        const tone = document.createElement('div');
        tone.classList.add('tone');
        tone.textContent = result.tone;
        word.appendChild(tone);

        wordContainer.appendChild(word);

        const meaning = document.createElement('div');
        meaning.classList.add('meaning');

        const meaningInput = document.createElement('input');
        meaningInput.classList.add('meaning-input');
        meaningInput.value = result.meaning;
        meaningInput.addEventListener('input', function () {
            subResults[i].meaning = this.value;
        });

        meaning.appendChild(meaningInput);
        wordContainer.appendChild(meaning);
        wordArea.appendChild(wordContainer);
    }
    results = subResults;
}

function generateRandomOptions(correctOption, count, type) {
    const options = [];
    const availableOptions = results.reduce((acc, option) => {
        if (option[type] !== correctOption) {
            acc.push(option[type]);
        }
        return acc;
    }, []);

    while (options.length < count && availableOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableOptions.length);
        const option = availableOptions[randomIndex];
        if (!options.includes(option)) {
            options.push(option);
            availableOptions.splice(randomIndex, 1);
        }
    }
    return options;
}

function createOptionElements(name, options) {
    const optionsDiv = document.createElement('div');
    optionsDiv.classList.add('option-list');

    options.forEach(option => {
        const optionContainer = document.createElement('div');
        optionContainer.classList.add('option-container');

        const optionLabel = document.createElement('label');
        optionLabel.textContent = option;

        const optionInput = document.createElement('input');
        optionInput.setAttribute('type', 'radio');
        optionInput.setAttribute('name', name);
        optionInput.setAttribute('value', option);


        optionContainer.appendChild(optionInput);
        optionContainer.appendChild(optionLabel);
        optionsDiv.appendChild(optionContainer);
    });

    return optionsDiv;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function learning_ch(subResults) { /*마지막 문제 풀때, 오답이 있어도 그냥 넘어가게 됌. 로직을 다시 생각해봐야 할듯. */
    let results = subResults; //내부용 results에 subResults 복사

    kakaoAd.style.display = 'none';

    mainArea.textContent = '';

    const learningChArea = document.createElement('div');
    learningChArea.classList.add('learning-ch-area');

    const indexLabel = document.createElement('div');
    indexLabel.classList.add('index-label');
    learningChArea.appendChild(indexLabel);

    const display = document.createElement('div');
    display.classList.add('display');

    const learningWord = document.createElement('div');
    learningWord.classList.add('learning-word');

    const word = document.createElement('div');
    word.classList.add('word');

    const chineseWord = document.createElement('div');
    chineseWord.classList.add('chinese-word');
    word.appendChild(chineseWord);

    const tone = document.createElement('div');
    tone.classList.add('tone');
    word.appendChild(tone);

    learningWord.appendChild(word);

    const meaning = document.createElement('div');
    meaning.classList.add('meaning');
    learningWord.appendChild(meaning);

    display.appendChild(learningWord);

    learningChArea.appendChild(display);

    const userAction = document.createElement('div');
    userAction.classList.add('user-action');
    learningChArea.appendChild(userAction);

    mainArea.appendChild(learningChArea);


    let usedIndices = new Set();
    let index = getNextIndex();
    let wrongAnswerIndexes = [];

    function getNextIndex() {
        if (usedIndices.size === results.length) {
            return -1; // 모든 문제를 사용했습니다.
        }

        let index;
        do {
            index = Math.floor(Math.random() * results.length);
        } while (usedIndices.has(index));

        usedIndices.add(index);
        return index;
    }

    function meaningQuiz() {
        indexLabel.textContent = `${usedIndices.size}/${results.length}`;
        chineseWord.textContent = results[index].chineseWord;
        chineseWord.addEventListener('click', () => {
            const speechSynthesis = window.speechSynthesis;
            speechSynthesis.cancel(); // 현재 음성 중단
            const utterance = new SpeechSynthesisUtterance(results[index].chineseWord);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        });
        meaning.style.display = 'none';

        const meaningOptions = generateRandomOptions(results[index].meaning, 3, 'meaning');
        const shuffledMeaningOptions = shuffleArray([results[index].meaning, ...meaningOptions]);
        const meaningOptionsDiv = createOptionElements('meaningOptions', shuffledMeaningOptions);
        userAction.appendChild(meaningOptionsDiv);
    }

    function toneQuiz() {
        userAction.innerHTML = '';

        meaning.style.display = 'flex';
        meaning.textContent = results[index].meaning;

        const speechSynthesis = window.speechSynthesis;
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(results[index].chineseWord);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);

        const toneOptions = generateRandomOptions(results[index].tone, 3, 'tone');
        const shuffledtoneOptions = shuffleArray([results[index].tone, ...toneOptions]);
        const toneOptionsDiv = createOptionElements('toneOptions', shuffledtoneOptions);
        userAction.appendChild(toneOptionsDiv);
    }

    let answerMeaning = "";
    let answerTone = "";
    let isMeaning = 0;
    let isTone = 0;
    let wrongcount = 0;

    function reset() {
        userAction.innerHTML = '';
        chineseWord.innerHTML = '';
        tone.innerHTML = '';
        meaning.innerHTML = '';
        answerMeaning = "";
        answerTone = "";
        wrongcount = 0;
        isMeaning = 0;
        isTone = 0;
        index = getNextIndex();
        meaningQuiz();
    }

    function complete() {
        userAction.innerHTML = '';
        tone.textContent = results[index].tone;

        const complete = document.createElement('div');
        complete.classList.add('complete');
        if (usedIndices.size !== results.length) {
            complete.addEventListener('click', function () {
                reset();
            });

            const comment = document.createElement('div');
            comment.classList.add('comment');
            if (wrongcount == 1) {
                comment.textContent = '나쁘지 않네요!'
            } else {
                comment.textContent = '다시 공부 하는게 좋겠어요'
            }
            complete.appendChild(comment);


            const meaningAnswer = document.createElement('div');
            meaningAnswer.classList.add('feedback');
            if (isMeaning == 0) {
                meaningAnswer.style.color = 'green';
            } else {
                meaningAnswer.style.color = 'red';
            }
            meaningAnswer.textContent = answerMeaning;
            complete.appendChild(meaningAnswer);

            const toneAnswer = document.createElement('div');
            toneAnswer.classList.add('feedback');
            toneAnswer.textContent = answerTone;
            if (isTone == 0) {
                toneAnswer.style.color = 'green';

            } else {
                toneAnswer.style.color = 'red';
            }
            complete.appendChild(toneAnswer);

            const desc = document.createElement('div');
            desc.classList.add('desc');
            desc.textContent = '클릭하여 계속';
            complete.appendChild(desc);
            userAction.appendChild(complete);

        } else {
            leaning_done();
        }



    }

    function leaning_done() {
        toggle.disabled = true;

        mainArea.innerHTML = '';

        const review_area = document.createElement('div');
        review_area.classList.add('name-area');
        mainArea.appendChild(review_area);

        const content_area = document.createElement('div');
        content_area.classList.add('content-area');
        review_area.appendChild(content_area);

        const btn_area = document.createElement('div');
        btn_area.classList.add('btn-area');
        review_area.appendChild(btn_area);

        subResults = wrongAnswerIndexes.map(index => results[index]);
        showWord(subResults, content_area);
        if (subResults.length > 0) {
            const retry = document.createElement('button');
            retry.addEventListener('click', async () => {
                results = subResults;
                learning_ch(subResults);
                retry.remove();

                if (isloggin == true) {
                    await setDoc(doc(db, "word", ` ${uid} + ${new Date()}`), {
                        uid: uid,
                        results,
                        timestamp: serverTimestamp(),
                        date: date,
                        listName: `[학습오답] ${defaultListName}`
                    });
                    console.log('saved wrong words');
                }
                toggle.disabled = false;
            });
            btn_area.appendChild(retry);

            const retry_img = document.createElement('img');
            retry_img.src = 'svg/retry.svg';
            retry.appendChild(retry_img);

            const p = document.createElement('p');
            p.textContent = '다시';
            retry.appendChild(p);
        } else {
            content_area.textContent = '모두 맞추셨네요! 축하드립니다!';
            content_area.style.fontSize = '6vw'
        }
        const done = document.createElement('button');
        done.addEventListener('click', () => window.location.href = "index.html");
        btn_area.appendChild(done);


        const done_img = document.createElement('img');
        done_img.src = 'svg/done.svg';
        done.appendChild(done_img);

        const p = document.createElement('p');
        p.textContent = '완료';
        done.appendChild(p);
    }

    userAction.addEventListener('click', function () {

        const userMeaningRadio = document.querySelector('input[name="meaningOptions"]:checked');
        const userToneRadio = document.querySelector('input[name="toneOptions"]:checked');

        if (userToneRadio) {
            const userTone = userToneRadio.value;
            const answer = document.createElement('div');
            answer.classList.add('answer');

            if (userTone === results[index].tone) {
                answer.textContent = '정답입니다!';
                answer.style.color = 'green';
            } else {
                answer.textContent = '오답입니다!';
                answer.style.color = 'red';

                if (!wrongAnswerIndexes.includes(index)) {
                    wrongAnswerIndexes.push(index);
                }

                isTone++;
            }
            answerTone = userTone;

            wrongcount = isMeaning + isTone;
            userAction.appendChild(answer);

            answer.style.animation = 'slide-in-out 1.5s forwards';

            answer.addEventListener('animationend', () => {
                if (wrongcount == 0 && usedIndices.size !== results.length) {
                    reset();
                } else if (wrongcount == 0 && usedIndices.size == results.length) {
                    leaning_done();
                } else if (wrongcount !== 0) {
                    complete();
                }
            });

        } else {
            const userMeaning = userMeaningRadio.value;
            const answer = document.createElement('div');
            answer.classList.add('answer');

            if (userMeaning === results[index].meaning) {
                answer.textContent = '정답입니다!';
                answer.style.color = 'green';
                // answerMeaning = '';
            } else {
                answer.textContent = '오답입니다!';
                answer.style.color = 'red';

                if (!wrongAnswerIndexes.includes(index)) {
                    wrongAnswerIndexes.push(index);
                }

                isMeaning++;
            }
            answerMeaning = userMeaning;
            userAction.appendChild(answer);

            answer.style.animation = 'slide-in-out 1.5s forwards';

            answer.addEventListener('animationend', () => {
                toneQuiz();
            });
        }
    });


    meaningQuiz(meaning, userAction);
}

function Test_ch(results) {
    console.log(results);

    kakaoAd.style.display = 'none';
    mainArea.innerHTML = '';

    const test_ch_area = document.createElement('div');
    test_ch_area.classList.add('test-ch-area');
    mainArea.appendChild(test_ch_area);

    const indexLabel = document.createElement('div');
    indexLabel.classList.add('index-label');
    test_ch_area.appendChild(indexLabel);

    const display = document.createElement('div');
    display.classList.add('test-ch-display');
    test_ch_area.appendChild(display);

    const answer_area = document.createElement('div');
    answer_area.classList.add('name-area');
    answer_area.style.flex = '4';
    answer_area.style.borderRadius = '10px 10px 35px 35px';
    test_ch_area.appendChild(answer_area);

    const content_area = document.createElement('div');
    content_area.classList.add('content-area');
    answer_area.appendChild(content_area);

    const answer = document.createElement('div');
    answer.classList.add('test-ch-answer');
    content_area.appendChild(answer);

    const meaningOption = document.createElement('div');
    meaningOption.classList.add('meaning-option');
    answer.appendChild(meaningOption);


    const toneOption = document.createElement('div');
    toneOption.classList.add('tone-option');
    answer.appendChild(toneOption);

    const btn_area = document.createElement('div');
    btn_area.classList.add('btn-area');
    answer_area.appendChild(btn_area);

    const submitButton = document.createElement('button');
    submitButton.addEventListener('click', checkAnswer);
    btn_area.appendChild(submitButton);

    const summitIcon = document.createElement('img');
    summitIcon.setAttribute("id", "summitIcon");
    summitIcon.src = 'svg/summit.svg';
    submitButton.appendChild(summitIcon);

    let usedIndices = new Set();
    let index = getNextIndex();
    let wrongAnswerCounts = [];
    let wrongAnswerIndexes = [];
    let correctAnswerCount = 0;

    function getNextIndex() {
        if (usedIndices.size === results.length) {
            return -1; // 모든 문제를 사용했습니다.
        }

        let index;
        do {
            index = Math.floor(Math.random() * results.length);
        } while (usedIndices.has(index));

        usedIndices.add(index);
        return index;
    }

    function displayQuestion() {
        indexLabel.textContent = `${usedIndices.size}/${results.length}`;
        display.textContent = results[index].chineseWord;

        meaningOption.innerHTML = ''; // Clear the existing meaning options
        const meaningOptions = generateRandomOptions(results[index].meaning, 3, 'meaning');
        const shuffledMeaningOptions = shuffleArray([results[index].meaning, ...meaningOptions]);
        const meaningOptionsDiv = createOptionElements('meaningOptions', shuffledMeaningOptions);
        meaningOption.appendChild(meaningOptionsDiv);

        toneOption.innerHTML = ''; // Clear the existing tone options
        const toneOptions = generateRandomOptions(results[index].tone, 3, 'tone');
        const shuffledToneOptions = shuffleArray([results[index].tone, ...toneOptions]);
        const toneOptionsDiv = createOptionElements('toneOptions', shuffledToneOptions);
        toneOption.appendChild(toneOptionsDiv);
    }

    function checkAnswer() {
        const userMeaningRadio = document.querySelector('input[name="meaningOptions"]:checked');
        const userToneRadio = document.querySelector('input[name="toneOptions"]:checked');

        if (!userMeaningRadio || !userToneRadio) {
            const summitIcon = document.getElementById('summitIcon');
            summitIcon.classList.add('denied-animation');
            setTimeout(() => {
                summitIcon.classList.remove('denied-animation');
            }, 1000);
            return;

        }

        const userMeaning = userMeaningRadio.value;
        const userTone = userToneRadio.value;

        if (userMeaning === results[index].meaning && userTone === results[index].tone) {
            // 정답일 경우
            correctAnswerCount++;
        } else {
            // 오답일 경우
            const wrongAnswerCount = (wrongAnswerCounts[index] || 0) + 1;
            wrongAnswerCounts[index] = wrongAnswerCount;

            if (!wrongAnswerIndexes.includes(index)) {
                wrongAnswerIndexes.push(index);
            }
        }

        if (usedIndices.size === results.length) {//문제 완료시 
            toggle.disabled = true;

            mainArea.textContent = '';

            const wrongAnswerInfo = document.createElement('div');
            wrongAnswerInfo.classList.add('wrong-answer-info');
            mainArea.appendChild(wrongAnswerInfo);

            const review_area = document.createElement('div');
            review_area.classList.add('name-area');
            mainArea.appendChild(review_area);

            const content_area = document.createElement('div');
            content_area.classList.add('content-area');
            review_area.appendChild(content_area);

            const btn_area = document.createElement('div');
            btn_area.classList.add('btn-area');
            review_area.appendChild(btn_area);


            // 오답 개수 표시
            const wrongAnswersCount = wrongAnswerIndexes.length;
            const wrongAnswersCountElement = document.createElement('p');
            wrongAnswersCountElement.classList.add('wrong-answers-count');
            wrongAnswersCountElement.textContent = `${wrongAnswersCount}/${results.length}`;
            wrongAnswerInfo.appendChild(wrongAnswersCountElement);

            // 정답률 표시
            const correctAnswersPercentage = (correctAnswerCount / results.length) * 100;
            const correctAnswersPercentageElement = document.createElement('p');
            correctAnswersPercentageElement.classList.add('correct-answers-percentage');
            correctAnswersPercentageElement.textContent = `${correctAnswersPercentage.toFixed(2)}%`;
            wrongAnswerInfo.appendChild(correctAnswersPercentageElement);

            subResults = wrongAnswerIndexes.map(index => results[index]);
            showWord(subResults, content_area);
            if (subResults.length > 0) {
                const retry = document.createElement('button');
                retry.addEventListener('click', async () => {
                    results = subResults;
                    Test_ch(subResults);
                    retry.remove();

                    await setDoc(doc(db, "word", `${uid} + ${new Date()}`), {
                        uid: uid,
                        results,
                        timestamp: serverTimestamp(),
                        date: date,
                        listName: `[테스트 오답] ${defaultListName}`
                    });
                    console.log('saved wrong words');
                    toggle.disabled = false;
                });
                btn_area.appendChild(retry);

                const retry_img = document.createElement('img');
                retry_img.src = 'svg/retry.svg';
                retry.appendChild(retry_img);

                const p = document.createElement('p');
                p.textContent = '재시험';
                retry.appendChild(p);

            } else {
                content_area.textContent = '모두 맞추셨네요! 축하드립니다!';
                content_area.style.fontSize = '6vw'
            }
            const done = document.createElement('button');
            done.addEventListener('click', () => window.location.href = "index.html");
            btn_area.appendChild(done);

            const done_img = document.createElement('img');
            done_img.src = 'svg/done.svg';
            done.appendChild(done_img);

            const p = document.createElement('p');
            p.textContent = '완료';
            done.appendChild(p);

        } else {// 다음 문제 표시
            index = getNextIndex();
            displayQuestion();
        }

    }

    displayQuestion();
}


function test_tone() {
    mainArea.innerHTML = "";

    const listenArea = document.createElement('div');
    listenArea.classList.add('listen-area');
    mainArea.appendChild(listenArea);

    const indexLabel = document.createElement('div');
    indexLabel.classList.add('index-label');

    // 문제 번호를 표시해주는 div 요소를 생성하고 indexLabel에 추가
    const index = document.createElement('div');
    index.classList.add('index');
    index.textContent = `1/${results.length}`;
    indexLabel.appendChild(index);

    // indexLabel을 mainArea에 추가
    mainArea.appendChild(indexLabel);

    const listenController = document.createElement('div');
    listenController.classList.add('listen-controller');
    mainArea.appendChild(listenController);


    let speechRate = 0.8; // 기본 음성 재생 속도

    const speedSliderDiv = document.createElement('div');
    speedSliderDiv.style.display = 'flex';
    speedSliderDiv.style.alignItems = 'center';
    listenController.appendChild(speedSliderDiv);

    const slowSpeed = document.createElement('img');
    slowSpeed.src = 'svg/speed.svg';
    slowSpeed.style.transform = 'scaleX(-1)';
    slowSpeed.style.margin = '0 5px';


    const speedSlider = document.createElement('input');

    speedSlider.type = 'range';
    speedSlider.min = '0.1';
    speedSlider.max = '2';
    speedSlider.step = '0.1';
    speedSlider.value = speechRate;
    speedSlider.style.width = '100%'

    speedSlider.oninput = function () {
        speechRate = parseFloat(this.value).toFixed(1);
        speedLabel.textContent = `${speechRate}`;
    };

    // 음성 재생 속도 라벨
    const speedLabel = document.createElement('label');
    speedLabel.style.fontSize = '20px';
    speedLabel.style.color = '#007bffce';
    speedLabel.style.margin = '0 10px';
    speedLabel.textContent = `${speechRate}`;
    speedLabel.style.whiteSpace = 'nowrap';

    const fastSpeed = document.createElement('img');
    fastSpeed.src = 'svg/speed.svg'
    fastSpeed.style.margin = '0 5px';


    speedSliderDiv.appendChild(speedLabel);
    speedSliderDiv.appendChild(slowSpeed);
    speedSliderDiv.appendChild(speedSlider);
    speedSliderDiv.appendChild(fastSpeed);

    const autoProgressDiv = document.createElement('div');
    autoProgressDiv.style.display = 'flex';
    autoProgressDiv.style.alignItems = 'center';
    autoProgressDiv.style.justifyContent = 'space-between';

    // 토글 래벨 생성
    const toggleLabel = document.createElement('label');
    toggleLabel.classList.add('toggle');

    // input 요소 생성
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = 'wordbook';

    // 스팬 요소 생성
    const toggleSpan = document.createElement('span');
    toggleSpan.classList.add('slider');

    // 내부 텍스트 요소 생성
    const toggleText = document.createElement('div');
    toggleText.textContent = '자동진행';

    let autoProgressInterval = 15; // 자동 진행 간격 (기본값: 15초)
    let autoProgress = false; // 자동 진행 여부
    let autoProgressTimer = null; // 자동 진행 타이머를 저장하는 변수

    function startAutoProgress() {
        // 이미 실행 중인 타이머가 있다면 중지
        if (autoProgressTimer !== null) {
            clearInterval(autoProgressTimer);
        }

        // 체크박스가 체크된 경우에만 자동 진행 시작
        if (autoProgress) {
            autoProgressTimer = setInterval(nextQuestion, autoProgressInterval * 1000);
        }
    }

    // 진행 간격을 표시할 인풋 요소 생성
    const intervalInput = document.createElement('input');
    intervalInput.style.width = '15%';
    intervalInput.style.height = '30px';
    intervalInput.style.border = 'none';
    intervalInput.style.backgroundColor = 'transparent';
    intervalInput.style.textAlign = 'center'; // 내용 가운데 정렬
    intervalInput.style.fontSize = '20px'; // 글자 크기를 16px로 설정
    intervalInput.style.color = 'white'; // 글자 색상을 흰색으로 설정
    intervalInput.type = 'number';
    intervalInput.value = autoProgressInterval;
    intervalInput.min = '5'; // 최소 5초
    intervalInput.step = '5'; // 5초 단위로 증가
    intervalInput.addEventListener('input', () => {
        // 입력된 값에서 숫자만 추출하여 설정
        const inputValue = intervalInput.value.replace(/\D/g, ''); // 숫자 이외의 문자 제거

        if (inputValue === '' || parseInt(inputValue) < 5) {
            intervalInput.value = '5';
            autoProgressInterval = 5; // 최소값 5로 설정
        } else if (parseInt(inputValue) > 999) {
            intervalInput.value = '999';
            autoProgressInterval = 999; // 최대값 999로 설정
        } else {
            autoProgressInterval = parseInt(inputValue);
        }

        // autoProgressInterval 업데이트
        startAutoProgress();
    });


    // 좌측 화살표 버튼
    const slowButton = document.createElement('button');
    slowButton.textContent = '◄';
    slowButton.addEventListener('click', () => {
        autoProgressInterval -= 5; // 5초 감소
        if (autoProgressInterval < 5) {
            autoProgressInterval = 5; // 최소값 설정
        }
        intervalInput.value = autoProgressInterval;
        startAutoProgress();
    });

    // 우측 화살표 버튼
    const fastButton = document.createElement('button');
    fastButton.textContent = '►';
    fastButton.addEventListener('click', () => {
        autoProgressInterval += 5; // 5초 증가
        intervalInput.value = autoProgressInterval;
        startAutoProgress();
    });

    const btn_area = document.createElement('div');
    btn_area.style.margin = '0 10px';
    btn_area.style.alignItems = 'center';
    btn_area.classList.add('btn-area');
    btn_area.classList.add('d');
    btn_area.appendChild(slowButton);
    btn_area.appendChild(intervalInput);
    btn_area.appendChild(fastButton);

    // 부모에 추가
    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(toggleSpan);
    toggleSpan.appendChild(toggleText);
    autoProgressDiv.appendChild(toggleLabel);
    autoProgressDiv.appendChild(btn_area);
    listenController.appendChild(autoProgressDiv);

    const buttons = btn_area.querySelectorAll('button');
    const inputs = btn_area.querySelectorAll('input');
    buttons.forEach(button => button.setAttribute('disabled', 'disabled'));
    inputs.forEach(input => input.setAttribute('disabled', 'disabled'));

    toggleInput.addEventListener('change', function () {

        if (this.checked) {
            autoProgress = true;
            buttons.forEach(button => button.removeAttribute('disabled'));
            inputs.forEach(input => input.removeAttribute('disabled'));
            btn_area.classList.remove('d');
        } else {
            autoProgress = false;
            buttons.forEach(button => button.setAttribute('disabled', 'disabled'));
            inputs.forEach(input => input.setAttribute('disabled', 'disabled'));
            btn_area.classList.add('d');
        }
        startAutoProgress();
    });


    const leaningMode = document.createElement('div');
    leaningMode.style.display = 'flex';
    leaningMode.style.alignItems = 'center';
    leaningMode.style.justifyContent = 'space-between';

    // 토글 래벨 생성
    const toggleLabel_2 = document.createElement('label');
    toggleLabel_2.classList.add('toggle');

    // input 요소 생성
    const toggleInput_2 = document.createElement('input');
    toggleInput_2.type = 'checkbox';
    toggleInput_2.id = 'wordbook';

    // 스팬 요소 생성
    const toggleSpan_2 = document.createElement('span');
    toggleSpan_2.classList.add('slider');

    // 내부 텍스트 요소 생성
    const toggleText_2 = document.createElement('div');
    toggleText_2.textContent = '학습모드';


    const voiceButton = document.createElement('button');
    voiceButton.textContent = '음성';
    voiceButton.addEventListener("click", speakChineseTone);

    const nextButton = document.createElement('button');
    nextButton.textContent = '다음';
    nextButton.addEventListener("click", nextQuestion);

    const btn_area_2 = document.createElement('div');
    btn_area_2.style.alignItems = 'center';
    btn_area_2.style.margin = '0 10px';

    btn_area_2.classList.add('btn-area');
    btn_area_2.classList.add('d');
    btn_area_2.appendChild(voiceButton);
    btn_area_2.appendChild(nextButton);

    // 부모에 추가
    toggleLabel_2.appendChild(toggleInput_2);
    toggleLabel_2.appendChild(toggleSpan_2);
    toggleSpan_2.appendChild(toggleText_2);
    leaningMode.appendChild(toggleLabel_2);
    leaningMode.appendChild(btn_area_2);
    listenController.appendChild(leaningMode);

    const buttons_2 = btn_area_2.querySelectorAll('button');
    buttons_2.forEach(button_2 => button_2.setAttribute('disabled', 'disabled'));

    toggleInput_2.addEventListener('change', function () {

        if (this.checked) {
            buttons_2.forEach(button_2 => button_2.removeAttribute('disabled'));
            btn_area_2.classList.remove('d');
        } else {
            buttons_2.forEach(button_2 => button_2.setAttribute('disabled', 'disabled'));
            btn_area_2.classList.add('d');
        }
    });


    const learningListen = document.createElement('div');
    learningListen.classList.add('learning-listen');
    mainArea.appendChild(learningListen);
    // 추가 개발 필요

    // Fisher-Yates 셔플 알고리즘으로 results 배열 무작위 섞기
    for (let i = results.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [results[i], results[j]] = [results[j], results[i]];
    }

    let currentIndex = 0; // 현재 문제의 인덱스를 추적하는 전역 변수
    let isAnswerButtonCreated = false;

    function nextQuestion() {
        // 문제 번호 업데이트 전에 먼저 결과 배열의 길이와 비교
        if (currentIndex < results.length - 1) {
            currentIndex++;

            index.textContent = `${currentIndex + 1}/${results.length}`;
            speakChineseTone();
        }

        // 모든 문제를 다 사용한 경우, "정답 보기" 버튼 생성
        if (currentIndex === results.length - 1 && !isAnswerButtonCreated) {

            nextButton.textContent = "정답";
            nextButton.addEventListener("click", () => {
                toggle.disabled = true;

                const review_area = document.createElement('div');
                review_area.classList.add('name-area');
                learningListen.appendChild(review_area);

                const content_area = document.createElement('div');
                content_area.classList.add('content-area');
                review_area.appendChild(content_area);

                const btn_area = document.createElement('div');
                btn_area.classList.add('btn-area');
                review_area.appendChild(btn_area);


                showWord(results, content_area);

                const retry = document.createElement('button');
                retry.addEventListener('click', async () => {
                    test_tone();
                    retry.remove();
                    toggle.disabled = false;
                });
                btn_area.appendChild(retry);


                const retry_img = document.createElement('img');
                retry_img.src = 'svg/retry.svg';
                retry.appendChild(retry_img);

                const p1 = document.createElement('p');
                p1.textContent = '다시';
                retry.appendChild(p1);

                const done = document.createElement('button');
                done.addEventListener('click', () => window.location.href = "index.html");
                btn_area.appendChild(done);

                const done_img = document.createElement('img');
                done_img.src = 'svg/done.svg';
                done.appendChild(done_img);

                const p2 = document.createElement('p');
                p2.textContent = '완료';
                done.appendChild(p2);
            });
            isAnswerButtonCreated = true;
        }

        if (autoProgress) {
            startAutoProgress();
        }
    }

    function speakChineseTone() {
        if (currentIndex < results.length) {
            const utterance = new SpeechSynthesisUtterance(results[currentIndex].chineseWord);
            utterance.lang = "zh-CN"; // 중국어로 설정
            utterance.rate = speechRate; // 음성 재생 속도를 슬라이더의 값으로 설정
            speechSynthesis.cancel(); // 현재 음성 중단
            speechSynthesis.speak(utterance); // 바로 음성 재생
        }
    }

    speakChineseTone();
}


