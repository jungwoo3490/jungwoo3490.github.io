---
title: "JS의 가비지 컬렉터는 어떻게 동작할까?"
category: "Dev"
date: "2023-08-04 12:00:00 +09:00"
desc: "JavaScript의 가비지 컬렉터에 관한 포스트입니다."
thumbnail: "./images/code-block/js.png"
alt: "code block graphic"
---

Garbage Collector에서 Garbage는 더이상 사용되어지지 않는 메모리지만 release(방출)되지 않은 메모리를 의미해요.

이를 이해하기 위해서는 메모리의 LifeCycle을 이해할 필요가 있어요.

메모리는 다음과 같이 Allocate Memory - Use Memory - Release Memory라는 3단계의 LifeCycle을 가져요.

![](https://velog.velcdn.com/images/jungwoo3490/post/4385a84e-fcac-42d4-881c-5d0e521760f8/image.png)

• Allocate memory - 생성한 Object에 메모리를 할당하는 것<br/>
• Use memory - 변수에서 메모리를 읽거나 쓰는 것<br/>
• Release memory - 할당한 메모리를 해제하는 것

JavaScript는 C언어 같은 언어들과 다르게 memory를 release해주는 함수가 존재하지 않아요.<br/>
이 역할을 가비지 컬렉터가 대신 해주게 됩니다.

즉, 가비지 컬렉션이란 더이상 필요하지 않은 메모리를 정리해주는 것을 의미해요. 이를 위해서는, 어떤 메모리가 더이상 필요하지 않은 메모리인지 판별할 수 있어야 하겠죠.

---

## 판별 방법

### 1. Memory Reference

어떤 메모리가 참조되어 있는지를 바탕으로 메모리가 Garbage인지 아닌지 판별하는 방법이다. 참조의 종류에는 2가지가 있어요.

#### • Implicit Reference<br/>

JavaScript Object는 prototype 같은 프로퍼티를 반드시 가지게 돼요. 이와 같이 암묵적으로 가지는 프로퍼티를 Implicit Reference라고 해요.

#### • Explicit Reference<br/>

우리가 명시적으로 선언한 프로퍼티를 Explicit Reference라고 해요.

가비지 컬렉터는 더 이상 참조가 일어나지 않는 변수를 메모리에서 제거합니다.

#### ※ 한계점

서로 다른 2개의 Object가 서로 참조하게 되어버리면(순환 참조) 절대 reference가 0이 될 수 없어요. 따라서 이 둘은 절대 release할 수 없게 된다는 문제가 있어요.

### 2. Mark and Sweep Algorithm

어떤 것이 garbage가 아닌지 마크하고(Mark), 마크되어있지 않은 가비지를 쓸어버리는(Sweep) 알고리즘이에요.

알고리즘의 동작 순서는 다음과 같아요.

1\. 가비지 컬렉터가 roots 리스트를 만들어요. roots는 모든 global 변수예요.(ex) window Object)

2\. Mark and Sweep Algorithm은 모든 roots와 roots의 children들을 전부 다 검사하면서 reachable한지 아닌지 검사해요. reachable한 노드는 Mark해요. reachable하지 않은 노드는 garbage로 인식해요.

3\. Mark 되어있지 않은 노드를 Sweep해서 그 메모리들을 release해서 OS로 return해요.

#### ※ 장점

root에서 reachable하지 않다면 순환 참조하는 경우도 garbage로 인식할 수 있어요.

#### ※ 한계점

다음과 같은 시나리오를 생각해볼게요.

1\. 굉장히 많은 변수를 Allocation한다.<br/>
2\. Allocate되는 대부분의 element는 unreachable하다.<br/>
3\. 더 이상 어떤 Allocation도 수행되지 않는다.<br/>

Mark and Sweep Algorithm에서 root 변수들은 메모리에 Allocation이 일어나야 생성돼요. 그 전까지 어떤 것이 garbage인지 판별할 수 없어 컬렉팅할 수 없어요.

처음 일어났던 Allocate memory 중에서 garbage로 판단되는 메모리들이 있음에도 불구하고 컬렉팅하지 않아요. 새로운 Allocation이 일어나야 root를 만들텐데 Allocation이 안 일어나니까 먼저 루트를 만들 수 없고, 결국 어떤 메모리가 garbage인지 판별할 수가 없어요.

이로 인해 memory leak(메모리 누수)이 발생하게 된다는 문제가 있어요.

---

## Memory Leak Case

### 1. Global Variables

선언 키워드 없이 변수를 선언하게 되면 그 변수는 window라는 global object의 프로퍼티로 할당되게 돼요. 그렇게 되면 그 변수를 모든 곳에 있는 코드가 reference할 수 있게 돼요.
함수 안에 지역변수를 선언한 경우 그 함수가 종료되면 메모리가 release되지만 window의 프로퍼티로 등록이 되어버리면 그 함수가 실행이 끝나더라도 그 변수는 메모리가 release되지 않아요. 결국 memory leak이 발생하게 됩니다. 따라서 메모리 누수를 방지하기 위해 선언 키워드를 사용하여 변수를 선언해야 해요.

generator가 아닌 일반적인 함수 내에서 this는 global object window를 가리켜요. 이로 인해 this.변수에 값을 할당할 경우 위 문제와 동일한 문제가 발생하게 돼요.

### 2. Timers or Callbacks that are forgotten

다음 코드를 살펴봅시다.

```javascript
var serverData = loadData()
setInterval(function () {
  var renderer = document.getElementById("renderer")
  if (renderer) {
    renderer.innerHTML = JSON.stringify(serverData)
  }
}, 5000)
```

위 코드에서는 DOM에서 가져온 renderer 객체가 바뀌거나 제거될 수 있어요. 그렇게 되면 renderer에는 setInterval의 핸들러가 참조하고 있는 serverData가 더이상 참조될 일이 없어져요. 하지만 setInterval로 이 핸들러가 5초마다 실행되도록 했기 때문에 serverData에 대한 참조가 사라지지 않아요. 이 경우 clearInterval로 참조를 해제해주어야 해요. DOM에서 가져온 element인 renderer 또한 removeElement로 제거해주어야 해요.

### 3. Closures

클로저는 메모리 누수를 발생시킬 수 있어요.

```javascript
var theThing = null

var replaceThing = function () {
  var originalThing = theThing
  var unused = function () {
    if (originalThing) {
      console.log("hi")
    }
  }

  theThing = {
    longStr: new Array(1000000).join("*"),
    someMethod: function () {
      console.log("message")
    },
  }
}

setInterval(replaceThing, 1000)
```

위 코드에서 2개의 클로저가 동일한 로컬 스코프를 공유하고 있어요. replaceThing의 호출이 종료되면 로컬 스코프가 제거되어야 하는데 제거되지 않아요. 그 이유는 theThing에 할당되어 있는 someMethod의 function을 통해서 이 로컬 스코프가 계속 reference되기 때문이에요. 이 로컬 스코프 안에 있는 originalThing을 참조하고 있는 unused function도 마찬가지로 로컬 스코프가 사라지지 않기 때문에 계속 남아있게 돼요. 이 함수는 이제 사용되어지지 않는데 release가 되지 않아요. 즉 garbage인데 컬렉팅이 되지 않게 돼요.

### 4. DOM에서 벗어난 요소 참조

DOM 노드를 데이터 구조 속에 저장하는 경우가 있어요. 그렇게 되면 동일한 DOM 요소에 대해 하나는 DOM 트리에, 하나는 데이터 구조에, 총 2개의 참조가 존재하는 셈이죠. 그 element를 제거하고자 한다면 이 2개의 참조 모두가 닿을 수 없도록 해주어야 해요.

특히 테이블 내의 셀 태그를 참조하다가 테이블을 DOM에서 제거한 상태에서 셀에 대한 참조를 갖고 있다면 엄청난 메모리 누수가 발생가헤 돼요. 테이블 셀에 대한 참조 하나만으로도 전체 테이블이 메모리에 남아있게 되기 때문이에요.
