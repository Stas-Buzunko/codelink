

require(['./Codelink'], function (Codelink) {
  console.log(Codelink)
  ReactDOM.render(
    <Codelink isOwnState={true} />,
    document.getElementById('root'))
    //foo is now loaded.
})
