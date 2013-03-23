function $(i){return document.getElementById(i);}
var bg=opera.extension.bgProcess,N=$('main'),L=$('sList'),O=$('overlay'),_=bg.getI18nString;
function fillHeight(e,b,p){
	if(p==undefined) p=e.parentNode;
	b=b?b.offsetTop+b.offsetHeight:0;
	e.style.pixelHeight=e.offsetHeight+window.getComputedStyle(p).pixelHeight-b;
}
function fillWidth(e,p){
	if(p==undefined) p=e.parentNode;
	e.style.pixelWidth=e.offsetWidth+window.getComputedStyle(p).pixelWidth-e.offsetLeft-e.offsetWidth;
}
fillHeight(L,$('footer'),document.body);

// Main options
function updateMove(d){
	if(!d) return;
	var b=d.querySelectorAll('.move');
	b[0].disabled=!d.previousSibling;
	b[1].disabled=!d.nextSibling;
}
function allowUpdate(n){return n.update&&n.meta.updateURL&&n.meta.downloadURL;}
var icons={};
function getIcon(n){
	if(n.meta.icon) {
		if(n.meta.icon in icons) return icons[n.meta.icon];
		var i=bg.getString('cache:'+n.meta.icon);
		if(i) return icons[n.meta.icon]='data:image/x;base64,'+btoa(i);
	}
	return 'images/icon64.png';
}
function loadItem(d,n,m){
	d.innerHTML='<img class=icon src="'+getIcon(n)+'">'
	+'<a class="name ellipsis"></a>'
	+'<span class=author></span>'
	+'<span class=version>'+(n.meta.version?'v'+n.meta.version:'')+'</span>'
	+(allowUpdate(n)?'<a data=update class=update href=#>'+_('Check for updates')+'</a> ':'')
	+'<div class="descrip ellipsis"></div>'
	+'<span class=message></span>'
	+'<div class=panel>'
		+'<button data=edit>'+_('Edit')+'</button> '
		+'<button data=enable>'+_(n.enabled?'Disable':'Enable')+'</button> '
		+'<button data=remove>'+_('Remove')+'</button>'
		+'<button data=up class=move>'+_('&uarr;')+'</button>'
		+'<button data=down class=move>'+_('&darr;')+'</button>'
	+'</div>';
	d.className=n.enabled?'':'disabled';
	with(d.querySelector('.name')) {
		var name=n.custom.name||n.meta.name,h=n.custom.homepage||n.meta.homepage;
		title=name||'';if(h) href=h;
		innerHTML=name?name.replace(/&/g,'&amp;').replace(/</g,'&lt;'):'<em>'+_('Null name')+'</em>';
	}
	if(n.meta.author) d.querySelector('.author').innerText=_('Author: ')+n.meta.author;
	with(d.querySelector('.descrip')) innerText=title=n.meta.description||'';
	if(m) d.querySelector('.message').innerHTML=m;
}
function addItem(n){
	var d=document.createElement('div');
	loadItem(d,n);
	L.appendChild(d);
	return d;
}
function moveUp(i,p){
	var x=bg.ids[i];
	bg.ids[i]=bg.ids[i-1];
	bg.ids[i-1]=x;
	L.insertBefore(p,p.previousSibling);
	bg.saveIDs();
	updateMove(p);updateMove(p.nextSibling);
}
L.onclick=function(e){
	var o=e.target,d=o.getAttribute('data'),p;
	if(!d) return;
	e.preventDefault();
	for(p=o;p&&p.parentNode!=L;p=p.parentNode);
	var i=Array.prototype.indexOf.call(L.childNodes,p);
	switch(d){
		case 'edit':
			edit(i);
			break;
		case 'enable':
			e=bg.map[bg.ids[i]];
			if(e.enabled=!e.enabled) {
				p.classList.remove('disabled');
				o.innerText=_('Disable');
			} else {
				p.classList.add('disabled');
				o.innerText=_('Enable');
			}
			bg.saveScript(e);
			break;
		case 'remove':
			bg.removeScript(i--);
			L.removeChild(p);
			updateMove(L.childNodes[i<0?0:i]);
			break;
		case 'update':
			check(i);
			break;
		case 'up':
			if(p.previousSibling) moveUp(i,p);
			break;
		case 'down':
			if(p.nextSibling) moveUp(i+1,p.nextSibling);
			break;
	}
};
$('bNew').onclick=function(){
	var d=bg.newScript(true);d=addItem(d);
	updateMove(d);updateMove(d.previousSibling);
};
$('bUpdate').onclick=function(){
	for(var i=0;i<bg.ids.length;i++) if(allowUpdate(bg.map[bg.ids[i]])) check(i);
};
if(!($('cDetail').checked=bg.getItem('showDetails',false))) L.classList.add('simple');
$('cDetail').onchange=function(){L.classList.toggle('simple');bg.setItem('showDetails',this.checked);};
var panel=N;
function switchTo(D){
	panel.classList.add('hide');D.classList.remove('hide');panel=D;
}
var dialogs=[];
function showDialog(D,z){
	if(!dialogs.length) {
		O.classList.remove('hide');
		setTimeout(function(){O.classList.add('overlay');},1);
	}
	if(!z) z=dialogs.length?dialogs[dialogs.length-1].zIndex+1:1;
	dialogs.push(D);
	O.style.zIndex=D.style.zIndex=D.zIndex=z;
	D.classList.remove('hide');
	D.style.top=(window.innerHeight-D.offsetHeight)/2+'px';
	D.style.left=(window.innerWidth-D.offsetWidth)/2+'px';
}
function closeDialog(){
	dialogs.pop().classList.add('hide');
	if(dialogs.length) O.style.zIndex=dialogs.length>1?dialogs[dialogs.length-1]:1;
	else {
		O.classList.remove('overlay');
		setTimeout(function(){O.classList.add('hide');},500);
	}
}
O.onclick=function(){
	if(dialogs.length) (dialogs[dialogs.length-1].close||closeDialog)();
};
function confirmCancel(dirty){
	return !dirty||confirm(_('Modifications are not saved!'));
}
function bindChange(e,d){
	function change(){d.forEach(function(i){i.dirty=true;});}
	e.forEach(function(i){i.onchange=change;});
}
window.addEventListener('DOMContentLoaded',function(){
	var nodes=document.querySelectorAll('.i18n'),c,s,i,j;
	for(i=0;i<nodes.length;i++)
		nodes[i].innerHTML=bg.getI18nString(nodes[i].innerHTML);
},true);

// Advanced
var A=$('advanced');
$('bAdvanced').onclick=function(){showDialog(A);};
$('cShow').checked=bg.getItem('showButton',true);
$('cShow').onchange=function(){bg.showButton(bg.setItem('showButton',this.checked));};
$('cInstall').checked=bg.installFile;
$('cInstall').onchange=function(){bg.setItem('installFile',bg.installFile=this.checked);};
$('tSearch').value=bg.search;
$('bDefSearch').onclick=function(){$('tSearch').value=_('Search$1');};
$('aExport').onclick=function(){showDialog(X);xLoad();};
$('aImport').onchange=function(e){
	var i,f,files=e.target.files;
	for(i=0;f=files[i];i++) {
		var r=new FileReader();
		r.onload=function(e){impo(e.target.result);};
		r.readAsBinaryString(f);
	}
};
$('aVacuum').onclick=function(){var t=this;t.disabled=true;bg.vacuum(function(){t.innerHTML=_('Data vacuumed');});};
A.close=$('aClose').onclick=function(){
	bg.setString('search',bg.search=$('tSearch').value);
	closeDialog();
};

// Import
function impo(b){
	var z=new JSZip();
	try{z.load(b);}catch(e){alert(_('Error loading zip file.'));return;}
	var vm=z.file('ViolentMonkey'),count=0;
	if(vm) try{vm=JSON.parse(vm.asText());}catch(e){opera.postError('Error parsing ViolentMonkey configuration.');}
	z.file(/\.user\.js$/).forEach(function(o){
		if(o.dir) return;
		var c=null,v,i;
		try{
			if(vm&&(v=vm[o.name])) {
				c=bg.map[v.id];
				if(c) for(i in v) c[i]=v[i];
				else c=v;
			}
			bg.parseScript(null,{code:o.asText()},c);
			count++;
		}catch(e){opera.postError('Error importing data: '+o.name+'\n'+e);}
	});
	alert(bg.format(_('$1 item(s) are imported.'),count));
}

// Export
var X=$('export'),xL=$('xList'),xE=$('bExport');
function xLoad() {
	xL.innerHTML='';xE.disabled=false;xE.innerHTML=_('Export');
	for(var i=0;i<bg.ids.length;i++) {
		var d=document.createElement('div');
		d.className='ellipsis';
		d.innerText=d.title=bg.map[bg.ids[i]].meta.name;
		xL.appendChild(d);
	}
}
xL.onclick=function(e){
	var t=e.target;
	if(t.parentNode!=this) return;
	t.classList.toggle('selected');
};
$('bSelect').onclick=function(){
	var c=xL.childNodes,v,i;
	for(i=0;i<c.length;i++) if(!c[i].classList.contains('selected')) break;
	v=i<c.length;
	for(i=0;i<c.length;i++) if(v) c[i].classList.add('selected'); else c[i].classList.remove('selected');
};
xE.onclick=function(){
	this.disabled=true;this.innerHTML=_('Exporting...');
	var z=new JSZip(),n,_n,names={},c,i,j,vm={};
	for(i=0;i<bg.ids.length;i++)
		if(xL.childNodes[i].classList.contains('selected')) {
			c=bg.map[bg.ids[i]];
			n=_n=c.custom.name||c.meta.name||'Noname';j=0;
			while(names[n]) n=_n+(++j);names[n]=1;n+='.user.js';
			z.file(n,c.code);
			vm[n]={id:bg.ids[i],custom:c.custom,enabled:c.enabled,update:c.update};
		}
	z.file('ViolentMonkey',JSON.stringify(vm));
	n=z.generate({compression:'DEFLATE'});
	window.open('data:application/zip;base64,'+n);
	X.close();
};
X.close=$('bClose').onclick=closeDialog;

// Update checker
function canUpdate(o,n){
	o=(o||'').split('.');n=(n||'').split('.');
	var r=/(\d*)([a-z]*)(\d*)([a-z]*)/i;
	while(o.length&&n.length) {
		var vo=o.shift().match(r),vn=n.shift().match(r);
		vo.shift();vn.shift();	// origin string
		vo[0]=parseInt(vo[0]||0,10);
		vo[2]=parseInt(vo[2]||0,10);
		vn[0]=parseInt(vn[0]||0,10);
		vn[2]=parseInt(vn[2]||0,10);
		while(vo.length&&vn.length) {
			var eo=vo.shift(),en=vn.shift();
			if(eo!=en) return eo<en;
		}
	}
	return n.length;
}
function check(i){
	var l=L.childNodes[i],s=bg.map[bg.ids[i]],o=l.querySelector('[data=update]'),m=l.querySelector('.message');
	m.innerHTML=_('Checking for updates...');
	o.classList.add('hide');
	function update(){
		m.innerHTML=_('Updating...');
		req=new window.XMLHttpRequest();
		req.open('GET', s.meta.downloadURL, true);
		req.onload=function(){
			var r=bg.parseScript(null,{status:req.status,code:req.responseText},s);
			if(r) m.innerHTML=r;
			o.classList.remove('hide');
		};
		req.send();
	}
	var req=new window.XMLHttpRequest();
	req.open('GET', s.meta.updateURL, true);
	req.onload=function(){
		try {
			var r=bg.parseMeta(req.responseText);
			if(canUpdate(s.meta.version,r.version)) return update();
			else m.innerHTML=_('No update found.');
		} catch(e) {
			m.innerHTML=_('Failed fetching update information.');
			opera.postError(e);
		}
		o.classList.remove('hide');
	};
	req.send();
}

// Script Editor
var E=$('editor'),U=$('eUpdate'),H=$('mURL'),R=$('mRunAt'),M=$('meta'),I=$('mName'),
    mI=$('mInclude'),mE=$('mExclude'),mM=$('mMatch'),
    cI=$('cInclude'),cE=$('cExclude'),cM=$('cMatch'),
		eS=$('eSave'),eSC=$('eSaveClose');
CodeMirror.keyMap.vm={
	'Esc':'close',
	'Ctrl-S':'save',
	fallthrough:'default'
};
function editor(e,i){
	var t=this;
	e.onchange=function(){t.clean=false;eS.disabled=eSC.disabled=t.isClean();};
	e.isClean=function(){return t.clean;};
	e.markClean=function(){t.clean=true;};
	e.getValue=function(){return this.value;};
	e.setValue=function(v){this.value=v;};
	t.editor=t.textarea=e;
	t.type=0;
	t.switchEditor(i?1:0);
}
editor.prototype={
	switchEditor:function(i){
		var t=this;
		if(i==undefined) i=!t.type;
		if(i!=t.type) {
			if(t.type=!t.type) {
				t.editor=CodeMirror.fromTextArea(t.editor,{
					lineNumbers:true,
					matchBrackets:true,
					mode:'text/typescript',
					lineWrapping:true,
					indentUnit:4,
					indentWithTabs:true,
					extraKeys:{"Enter":"newlineAndIndentContinueComment"},
					keyMap:'vm'
				});
				t.editor.on('change',function(){t.clean=false;eS.disabled=eSC.disabled=t.isClean();});
			} else {
				t.clean&=t.editor.isClean();
				t.editor.toTextArea();t.editor=t.textarea;
			}
			t.type=i;
		}
	},
	clean:true,
	focus:function(){return this.editor.focus();},
	resize:function(){var w=this.getWrapperElement();fillHeight(w,w.nextElementSibling);},
	isClean:function(){return this.clean&&this.editor.isClean();},
	markClean:function(){this.clean=true;this.editor.markClean();eS.disabled=eSC.disabled=true;},
	getValue:function(){return this.editor.getValue();},
	setValue:function(t){this.editor.setValue(t);this.editor.getDoc&&this.editor.getDoc().clearHistory();},
	getWrapperElement:function(e){e=this.editor;return e.getWrapperElement?e.getWrapperElement():e;},
};
var T=new editor($('eCode'),bg.getItem('editorType',0));
(function(b){
	function switchCommand(){
		b.innerHTML=T.type?_('Switch to normal editor'):_('Switch to advanced editor');
	}
	b.onclick=function(){
		T.switchEditor();T.resize();bg.setItem('editorType',T.type);switchCommand();
	};
	switchCommand();
})($('beditor'));
function edit(i){
	switchTo(E);E.scr=bg.map[bg.ids[i]];E.cur=L.childNodes[i];
	U.checked=E.scr.update;H.value=E.scr.custom.homepage||'';
	T.resize();T.setValue(E.scr.code);T.markClean();T.focus();
}
function eSave(){
	E.scr.update=U.checked;E.scr.custom.homepage=H.value;
	bg.parseScript(null,{code:T.getValue()},E.scr);
	T.markClean();loadItem(E.cur,E.scr);eS.disabled=eSC.disabled=true;
}
function eClose(){switchTo(N);E.cur=E.scr=null;T.setValue('');}
function split(t){return t.replace(/^\s+|\s+$/g,'').split(/\s*\n\s*/).filter(function(e){return e;});}
bindChange([U,H],[E]);
$('bcustom').onclick=function(){
	var e=[],c=E.scr.custom;
	M.dirty=false;showDialog(M,10);
	fillWidth(I);fillWidth(H);
	I.value=c.name||'';
	H.value=c.homepage||'';
	switch(c['run-at']){
		case 'document-start':R.value='start';break;
		case 'document-body':R.value='body';break;
		case 'document-end':R.value='end';break;
		default:R.value='default';
	}
	cI.checked=c._include!=false;
	mI.value=(c.include||e).join('\n');
	cM.checked=c._match!=false;
	mM.value=(c.match||e).join('\n');
	cE.checked=c._exclude!=false;
	mE.value=(c.exclude||e).join('\n');
};
bindChange([I,H,R,mI,mM,mE,cI,cM,cE],[M]);
M.close=function(){if(confirmCancel(M.dirty)) closeDialog();};
$('mCancel').onclick=closeDialog;
$('mOK').onclick=function(){
	if(M.dirty) {
		var c=E.scr.custom;
		c.name=I.value;
		c.homepage=H.value;
		switch(R.value){
			case 'start':c['run-at']='document-start';break;
			case 'body':c['run-at']='document-body';break;
			case 'end':c['run-at']='document-end';break;
			default:delete c['run-at'];
		}
		c._include=cI.checked;
		c.include=split(mI.value);
		c._match=cM.checked;
		c.match=split(mM.value);
		c._exclude=cE.checked;
		c.exclude=split(mE.value);
		loadItem(E.cur,E.scr);
		updateMove(E.cur);
		bg.saveScript(E.scr);
	}
	closeDialog();
};
eS.onclick=eSave;
eSC.onclick=function(){eSave();eClose();};
CodeMirror.commands.save=function(){if(!eS.disabled) setTimeout(eSave,0);};
CodeMirror.commands.close=E.close=$('eClose').onclick=function(){if(confirmCancel(!eS.disabled)) eClose();};

// Load at last
L.innerHTML='';
bg.ids.forEach(function(i){addItem(bg.map[i]);});
updateMove(L.firstChild);updateMove(L.lastChild);
function updateItem(t,i,r){
	var p=L.childNodes[i],n=bg.map[bg.ids[i]];
	switch(t){
		case 'add':addItem(n);updateMove(L.childNodes[i-1]);break;
		case 'update':loadItem(p,n,r);break;
	}
	updateMove(L.childNodes[i]);
};
if(!bg.options.window) bg.options.window=window;
