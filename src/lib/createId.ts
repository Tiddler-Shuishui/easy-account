let id: number = parseInt(window.localStorage.getItem('idMax') || '0') || 0
function createId(){
  id++
  return id
}

export default createId