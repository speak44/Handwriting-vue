
// 在 03-kvue.html 中数据发生频繁变化的时候，data 没有获取到。
// setInterval(() => {
//   app.counter++ 
//   //是因为在这里的时候，它直接修改的是，app里面的内容，进行的赋值，而上面在class KVue 中，响应式处理的是data的，observe(this.$data)
// }, 1000);
// 如果想要看效果，只能将app.counter++ ，修改为 app.$data.counter++
// 代理 data中的数据
function proxy(vm){
  Object.keys(vm.$data).forEach(key=>{ //将data的每一项遍历，进行数据修改和获取拦截处理
    Object.defineProperty(vm,key,{
      get(){
        return vm.$data[key]
      },
      set(v){ //新值赋值
        vm.$data[key]=v
      }
    })
  })
}




//  new Vue({})  所以先生成一个class类
  class KVue {
    constructor(options){
      // 保存选项
      this.$options =options
      this.$data = options.data // 数据拦截是，传进来的data，里的数据进行了响应式处理
      // 响应式处理
      observe(this.$data)
      // 当修改的的形式是 app.counter++
      proxy(this)
      // Compiler: 编译器  解析模版 找到依赖； 和前面拦截的的属性，进行拦截。
      new Compiler('#app', this)
    }
  }
// 对象的所有属性进行拦截
function observe(obj){
  if(typeof obj !== 'object' || obj==null){
    return
  }
  // 创建一个observer实例对象，目的是：出现一个对象就有一个observer的实例
  new Observer(obj)
}

// 负责数据响应化
// 首先执行数据响应式，当数据进来的时候，让它通过get 和set 的方法，进行监听修改；
// 当数据发生改变的时候可以检测到，当获取的时候可以做拦截，从而达到数据响应式
class Observer{
  constructor(value){  //  接收一个值 
    //
    this.value=value
    // 拦截下value
    this.walk(value)
  }

  // 遍历对象做响应式
  walk(obj) {
    Object.keys(obj).forEach((key)=>{
      defineReactive(obj,key,obj[key])
    })
  }
}
 //数据进行响应式处理
function defineReactive(obj,key,val){
  observe(val)
  Object.defineProperty(obj,key,{
    get(){
      console.log('get', val)
      return val
    },
    set(newVal){
      if(newVal!==val){
        console.log('set', newVal)
        observe(newVal) // 如果赋值的是对象的化，还需要递归进行数据响应式处理
        val =newVal
      }
    }
  })
}


// 在 03-kvue.html 中数据发生频繁变化的时候，data 没有获取到。
// setInterval(() => {
//   app.counter++ 
//   //是因为在这里的时候，它直接修改的是，app里面的内容，进行的赋值，而上面在class KVue 中，响应式处理的是data的，observe(this.$data)
// }, 1000);
// 如果想要看效果，只能将app.counter++ ，修改为 app.$data.counter++

// Compiler: 编译器  解析模版 找到依赖； 和前面拦截的的属性，进行拦截。
// new Compiler('#app', wv)  // 参数为： 宿主元素 （需要遍历结构） ， 当前实例
class Compiler {
  constructor(el,vm){
    this.$vm =vm
    this.$el = document.querySelector(el)
    // 执行编译
    this.compiler(this.$el)
  }
  // 将dome元素上的节点进行遍历 
  // <div id="app">
  //   <p>{{counter}}</p>
  //   </div>
  compiler(el){
    // console.log( el.childNodes, ' el.childNodes')
    el.childNodes.forEach(node =>{
      //是否是元素
      if(node.nodeType === 1){
        console.log('元素', node.nodeName)
        this.compileHtml(node)
      }else if(this.isIner(node)){ //插值，双括号{{}}
        console.log('编译文本', node.textContent)
        this.compileText(node)
      }
      // 递归，根元素 里面还有子元素
        if(node.childNodes){
          this.compiler(node)
        }
    })
  }
  // 解析绑定 插值表达式 例如：{{counter}} 解析之后， 页面显示 1 
  compileText(node){
    // console.log(RegExp)  RegExp.$1 正则表达式的$1 是返回的内容
    // console.log(this.$vm, 'this.$vm') // 当前kvue实例
    node.textContent =this.$vm[RegExp.$1] // 拿出来的值转化后进行替换，node.textContent
    // 相当于完成了初始化
  }
  // 编译元素 html元素
  compileHtml(node){
  // 处理元素上的属性 如：@- k-（如果是vue的化是，v-；目前写的是自己的模拟kvue；所以开头都是k-）
    // console.log(node.attributes,'node')
    const attrs =node.attributes
    console.log(attrs,'attrs')
    Array.from(attrs).forEach(item =>{
      // console.log(item, 'item')
      const attrName = item.nodeName // v-text
      const exp = item.value // counter
      if(attrName.indexOf('k-')===0){ // 判断是否是k- 开头的指令
        // 截取到 k- 后面的指令是什么。
        const dir = attrName.substring(2) // text
        // this[dir]==text 就调用text(node,exp)这个方法 看是否有对应的方法 有则执行
        this[dir]&&this[dir](node,exp)
      }
      if(attrName.indexOf('@')===0){
        // console.log(dir,'dir')
        // console.log(this.$vm.$options.methods,'thisadd')
        const fn = this.$vm.$options.methods
        const dir = attrName.substring(1) // text
        const _this =this.$vm
        node.addEventListener(dir,function () {
          return fn[exp].call(_this)
        })
      }
    })
  }
  // k-text的处理
  text(node, exp){
    node.textContent =this.$vm[exp] // 找到这个vue实例的couter
  }
  // k-html 的处理
  html(node, exp){
    node.innerHTML = this.$vm[exp]
  }
  // 点击事件处理
  // click(node, exp){
  //   console.log(node,'click')
  // }
  // 文本节点 {{111222}}
  isIner(node){
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
}

//依赖收集：
// 视图中：<p>{{counter}}</p> ，在'{{}}' 里面写的是 data中的key值，称为依赖；同一个key出现多次，每次都需要被收集起来，
// 用一个watcher 来进行维护。此过程被称为依赖收集
// <p>{{counter1}}</p>
// <p>{{counter2}}</p>
// <p>{{counter1}}</p>
// 以上内容就可以得知，会出现三个watcher（观察者）；
// 多个warcher 需要一个Dep来进行管理，需要更新时，由Dep统一通知。
// 页面出现多少次key 就会有多少watcher； 而data中由几个key 就会有几个Dep
// watcher 往 Dep 添加订阅者
// Dep 往 watcher 通知改变  watcher去更改视图

class watcher{

}

class Dep{

}