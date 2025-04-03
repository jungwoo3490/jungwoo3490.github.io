---
title: "모달 닫기 버튼 클릭 안 되는 이슈 트러블슈팅(feat. 이벤트 버블링)"
category: "Dev"
date: "2024-01-19 06:09:00 +09:00"
desc: "모달 닫기 버튼이 클릭되지 않는 원인을 파악하고 이슈를 해결한 과정에 대한 포스트입니다."
thumbnail: "./images/code-block/js.png"
alt: "code block graphic"
---

React로 개발 중인 프로젝트 진행 도중 문제가 발생했어요.

문제는 다음과 같은 포스트잇 모달에서 발생했어요.<br />
뒷배경으로 보이는 작은 포스트잇을 클릭하면 다음과 같이 해당 포스트잇에 대한 정보를 담은 포스트잇 모달을 오버레이시켰어요.

<img src="https://velog.velcdn.com/images/jungwoo3490/post/3dfd2790-49ea-4ab9-8e88-3c1cd98cbcc3/image.png" width="60%">

<br />

Modal은 React의 CreatePortal을 사용하여 구현했어요.

작은 포스트잇을 클릭하면 Modal이 팝업되는 것은 잘 동작하는데, Modal이 팝업되었을 때 X 버튼을 눌러도 Modal이 닫히지 않는 버그가 발생했어요.

모달 팝업 기능을 구현한 코드는 다음과 같아요.

```ts
// SmallLecueNote.tsx

const [modalShow, setModalShow] = useState(false)

const getClickedNote = () => noteList.find(note => note.noteId === noteId)

const handleClickSmallLecueNote = () => {
  const clickedNote = getClickedNote()
  if (clickedNote) {
    setModalShow(true)
  }
}

// 중략...

{
  modalShow && (
    <LecueNoteModal
      selectedNote={getClickedNote()}
      closeModal={() => setModalShow(false)}
    />
  )
}
```

뒷배경에 있는 작은 포스트잇이 SmallLecueNote 컴포넌트이고, 각 포스트잇마다 Modal의 팝업 여부를 결정하는 modalShow state를 관리해요.

포스트잇을 클릭하면 handleClickSmallLecueNote 이벤트 핸들러가 동작해요. 포스트잇을 클릭하면 getClickedNote를 통해 전체 noteList에서 현재 클릭된 노트가 무엇인지 찾아서 그 객체를 가져와요. 잘 가져왔으면 <code>setModalShow(true)</code>로 Modal을 팝업시키도록 했어요.

Modal의 prop으로 closeModal 함수를 내려주는데, 이 함수는 <code>setModalShow(false)</code>로 모달을 닫아버려요.

```ts
// LecueNoteModal.tsx

interface LecueNoteModalProps {
  selectedNote: NoteType | undefined
  closeModal: () => void
}

function LecueNoteModal({ selectedNote, closeModal }: LecueNoteModalProps) {
  const handleCloseButtonClick = () => {
    closeModal()
  }

  return createPortal(
    <S.BlurryContainer>
      ...
      <S.CloseButton type="button" onClick={handleCloseButtonClick}>
        <IcX />
      </S.CloseButton>
      ...
    </S.BlurryContainer>,
    modalContainer
  )
}

export default LecueNoteModal
```

LecueNoteModal에서 CloseButton이 눌렸을 때 onClick 이벤트 핸들러로 handleCloseButtonClick 함수를 달아주었어요.
handleCloseButtonClick 함수는 prop으로 내려온 closeModal을 실행, 즉 모달을 닫아버려요.

즉, X 버튼을 누르면 모달이 닫혀야 정상인데, 이상하게 모달이 닫히지 않았어요.

결국 modalShow가 modal의 팝업 여부를 결정하기 때문에, modalShow 상태값을 추적해보았어요.<br/>
추적 결과, X 버튼을 누르더라도 modalShow값이 true로 유지되는것을 확인했어요.

현재 내 코드에서 modalShow를 변경시키는 함수는 부모 컴포넌트인 SmallLecueNote에 있는 handleClickSmallLecueNote 핸들러와 자식 컴포넌트인 LecueNoteModal에 있는 handleCloseButtonClick 핸들러, 단 2개뿐이었어요.

두 함수 내부에 console을 찍어서 함수 호출 여부 및 순서를 확인해보았어요. 그 결과 신기한 현상이 발생했어요.<br/>
X 버튼을 눌렀는데, 자식 컴포넌트 핸들러가 실행된 즉시 부모 컴포넌트 핸들러가 실행되었어요.

대체 뭐가 문제일까... 굉장히 많은 고민을 해보았어요.<br/>
고민을 하다가 문득 세미나 때 들었던 이벤트 전파에 대해서 떠올렸고, 상위 컴포넌트로 이벤트가 전파되는 이벤트 버블링 때문일수도 있겠다는 생각이 들었어요.

## Event Bubbling

이벤트 버블링은 특정 화면 요소에서 이벤트가 발생했을 때 해당 이벤트가 더 상위의 화면 요소들로 전달되어 가는 특성을 의미해요.

![](https://velog.velcdn.com/images/jungwoo3490/post/f08480aa-c391-4bae-9461-be08d5ee9fe1/image.png)

예를 들어 다음 코드를 생각해볼게요.

```html
<!-- index.html -->

<body>
  <div class="one">
    <div class="two">
      <div class="three"></div>
    </div>
  </div>
</body>
```

```js
// index.js

var divs = document.querySelectorAll("div")
divs.forEach(function (div) {
  div.addEventListener("click", logEvent)
})

function logEvent(event) {
  console.log(event.currentTarget.className)
}
```

각 div를 클릭하면 클릭된 div의 className을 console에 출력하는 간단한 코드예요.

여기서 class가 three인 div를 누르면 어떻게 될까요?<br/>
console에 three만 찍힐 것이라고 예상을 할 수도 있겠지만, console을 확인해보면 결과는 다음과 같아요.

![](https://velog.velcdn.com/images/jungwoo3490/post/2e92cac3-725f-47d6-a59d-4bbef870892d/image.png)

왜 이런 일이 일어날까요?

브라우저는 기본적으로 특정 화면 요소에서 이벤트가 전파되었을 떄 그 이벤트를 최상위에 있는 화면 요소까지 전파시켜요.

위 코드에서 가장 하위 level에 있는 class three div를 클릭하면 이 클릭 이벤트가 상위로 전파되어 class two div의 click 이벤트 핸들러가 동작하고, 클릭 이벤트가 또 상위로 전파되어 class one div click 이벤트 핸들러가 동작해요. 그래서 three -> two -> one 순서대로 console에 찍히게 되는 것이에요.

다시 제가 작성했던 코드로 돌아가볼게요.

```tsx
// SmallLecueNote.tsx

return (
  <S.SmallLecueNoteWrapper
    renderType={renderType}
    noteTextColor={noteTextColor}
    noteBackground={noteBackground}
    onClick={handleClickSmallLecueNote}
  >
    ...
    {modalShow && (
      <LecueNoteModal
        selectedNote={getClickedNote()}
        closeModal={() => setModalShow(false)}
      />
    )}
    ...
  </S.SmallLecueNoteWrapper>
)
```

이벤트 버블링의 원리를 제가 겪은 이슈에 적용해보면, 문제가 발생했던 이유를 쉽게 파악할 수 있어요.
현재 SmallLecueNoteWrapper의 onClick 이벤트 핸들러로 Modal이 팝업되는 함수가 바인딩되어있고, 자식 컴포넌트인 LecueNoteModal 컴포넌트는 onClick 이벤트 핸들러로 Modal이 사라지는 함수가 바인딩되어있어요.

자식 컴포넌트 LecueNoteModal을 클릭하면, onClick 이벤트가 발생하여 Modal이 사라지는 함수가 동작해요. 그 후 클릭 이벤트가 상위 컴포넌트인 SmallLecueNoteWrapper로 전파되어 Modal이 팝업되는 함수가 동작해요.

그래서 결국 Modal이 사라지지 않고 팝업된 상태로 남아있는 것이었어요.

## 이벤트 버블링 해결하기

처음에는 <code>event.stopPropagation()</code>으로 Modal 닫기 버튼 클릭 이벤트 전파를 강제로 막았어요.

```ts
const handleCloseButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.stopPropagation()
  closeModal()
}
```

하지만 "강제"로 막는 것은 의도치 않은 사이드 이펙트를 야기할 위험성이 존재한다고 생각했어요. 원인이 이벤트 버블링 때문인 것을 알았으니, 이제 구조 변경을 통해 이벤트 버블링을 해결하고자 했어요.

```tsx
// SmallLecueNote.tsx

<React.Fragment>
  {modalShow && (
    <LecueNoteModal
      selectedNote={getClickedNote()}
      closeModal={() => setModalShow(false)}
    />
  )}
  <S.SmallLecueNoteWrapper
    renderType={renderType}
    noteTextColor={noteTextColor}
    onClick={handleClickSmallLecueNote}
  >
    ...
  </S.SmallLecueNoteWrapper>
</React.Fragment>
```

다음과 같이 구조를 변경했어요. Modal은 전체 화면을 기준으로 위치를 잡기 때문에 SmallLecueNoteWrapper와의 상대 위치값을 고려할 필요가 없었고, 따라서 Click 이벤트 핸들러가 등록된 SmallLecueNoteWrapper 밖으로 Modal을 분리시켜서 동일한 Level에 위치시켰어요. 이렇게 하면 두 컴포넌트 모두 부모-자식 포함관계가 아니므로 이벤트 버블링을 걱정하지 않아도 될 것이라고 생각했어요.

실제로 위와 같이 구조를 수정하여 이벤트 버블링 문제를 성공적으로 해결했어요.
