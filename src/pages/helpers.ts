export function setListeners(id: string, classNames: string): void {
  let elem = document.getElementById(id);
  let topbaritems = document.getElementsByClassName(classNames);

  if (elem && topbaritems) {
    let items = topbaritems[0] as HTMLElement;
    let chidlren = items.children;
    let width = 0;
    if (chidlren && chidlren.length > 0) {
        for (let j = 0; j < chidlren.length; j++) {
            console.info("children exist!!!");
            let a = chidlren[j] as Element;
            width += a.clientWidth;
        }
        elem.style.right = width + 50 + "px";
        elem.style.paddingRight = "30px";
    }
  }
}
