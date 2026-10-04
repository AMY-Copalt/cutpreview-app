// HTML document for the WebView-based 3D avatar.
// Renders the SAME parametric stylized head used by the native viewer, but
// using the device browser's WebGL engine (via react-native-webview) instead
// of expo-gl — which renders black inside Expo Go on Android.
//
// three.js is loaded as a UMD global from a CDN. All scene state arrives from
// React Native via window.__update(payload). Gestures (rotate / pinch-zoom /
// double-tap reset) are handled inside the page. If WebGL is unavailable or
// three fails to load, the page posts {type:"error"} so RN can show the 2D
// fallback.

export const THREE_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

export function buildSceneHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  html, body { margin:0; padding:0; width:100%; height:100%; background:#0A0A0A; overflow:hidden; }
  #c { display:block; width:100vw; height:100vh; touch-action:none; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
  function post(obj){
    try { window.ReactNativeWebView.postMessage(JSON.stringify(obj)); } catch(e){}
  }
  window.onerror = function(msg){ post({ type:"error", reason:"js:"+msg }); };

  function boot(){
    if (!window.THREE) { post({ type:"error", reason:"three_not_loaded" }); return; }
    var THREE = window.THREE;
    var canvas = document.getElementById("c");

    // WebGL capability check
    var test = document.createElement("canvas");
    var ok = !!(test.getContext("webgl") || test.getContext("experimental-webgl"));
    if (!ok) { post({ type:"error", reason:"no_webgl" }); return; }

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    } catch(e) {
      post({ type:"error", reason:"renderer:"+e.message }); return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x0a0a0a, 1);

    function size(){
      var w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.2, 5.4);
    camera.lookAt(0,0,0);

    var ambient = new THREE.AmbientLight(0xffffff, 0.5); scene.add(ambient);
    var warm = new THREE.PointLight(0xffb066, 1.1, 30); warm.position.set(3,3,4); scene.add(warm);
    var cool = new THREE.PointLight(0x88bbff, 0.15, 30); cool.position.set(-3,2,2); scene.add(cool);

    var root = new THREE.Group(); scene.add(root);

    var skin = new THREE.MeshStandardMaterial({ color: new THREE.Color("#D9AC8C"), roughness:0.7, metalness:0 });

    var head = new THREE.Mesh(new THREE.SphereGeometry(1,40,40), skin);
    head.scale.set(0.85,1.05,0.9); root.add(head);

    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.42,0.45,20), skin);
    neck.position.set(0,-1.05,0); root.add(neck);

    var eyeMat = new THREE.MeshBasicMaterial({ color:0x111111 });
    var eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.07,12,12), eyeMat);
    eyeL.position.set(-0.27,0.08,0.78); root.add(eyeL);
    var eyeR = eyeL.clone(); eyeR.position.x = 0.27; root.add(eyeR);

    var hairMat = new THREE.MeshStandardMaterial({ color:new THREE.Color("#1B1B1B"), roughness:0.55, metalness:0.05 });

    var hairTop = new THREE.Mesh(new THREE.SphereGeometry(1.05,32,32,0,Math.PI*2,0,Math.PI/2), hairMat.clone());
    hairTop.scale.set(0.9,0.55,0.95); hairTop.position.set(0,0.55,0); root.add(hairTop);

    var hairFringe = new THREE.Mesh(new THREE.SphereGeometry(0.55,20,20,0,Math.PI,0,Math.PI/2), hairMat.clone());
    hairFringe.rotation.x = Math.PI/2.2; hairFringe.position.set(0,0.55,0.62); hairFringe.scale.set(1.1,0.6,0.5); root.add(hairFringe);

    var hairSidesL = new THREE.Mesh(new THREE.BoxGeometry(0.35,0.9,0.6), hairMat.clone());
    hairSidesL.position.set(-0.78,0.05,0); root.add(hairSidesL);
    var hairSidesR = hairSidesL.clone(); hairSidesR.material = hairSidesL.material.clone(); hairSidesR.position.x = 0.78; root.add(hairSidesR);

    var hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.9,24,24,0,Math.PI*2,0,Math.PI/2), hairMat.clone());
    hairBack.scale.set(0.9,0.7,0.55); hairBack.position.set(0,0.2,-0.55); hairBack.rotation.x = Math.PI; root.add(hairBack);

    var sideburnsL = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.28,0.1), hairMat.clone());
    sideburnsL.position.set(-0.68,-0.28,0.35); root.add(sideburnsL);
    var sideburnsR = sideburnsL.clone(); sideburnsR.material = sideburnsL.material.clone(); sideburnsR.position.x = 0.68; root.add(sideburnsR);

    var beard = new THREE.Mesh(new THREE.SphereGeometry(0.6,24,24,0,Math.PI*2,0,Math.PI/2), hairMat.clone());
    beard.scale.set(0.95,0.45,0.55); beard.position.set(0,-0.58,0.35); beard.rotation.x = Math.PI; root.add(beard);

    var hairCrown = new THREE.Mesh(new THREE.SphereGeometry(1.1,32,32,0,Math.PI*2,0,Math.PI/2), hairMat.clone());
    hairCrown.scale.set(1,0.65,1); hairCrown.position.set(0,0.58,0); root.add(hairCrown);

    var hairLayers = new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.15,1.1,24,6,true), hairMat.clone());
    hairLayers.position.set(0,0.1,0); root.add(hairLayers);

    var hairBangs = new THREE.Mesh(new THREE.BoxGeometry(1.3,0.35,0.35), hairMat.clone());
    hairBangs.position.set(0,0.55,0.72); root.add(hairBangs);

    var hairEnds = new THREE.Mesh(new THREE.CylinderGeometry(1.1,0.6,0.9,24,4,true), hairMat.clone());
    hairEnds.position.set(0,-0.9,-0.15); root.add(hairEnds);

    var M = { head:head, hairTop:hairTop, hairFringe:hairFringe, hairSidesL:hairSidesL, hairSidesR:hairSidesR,
      hairBack:hairBack, sideburnsL:sideburnsL, sideburnsR:sideburnsR, beard:beard,
      hairCrown:hairCrown, hairLayers:hairLayers, hairBangs:hairBangs, hairEnds:hairEnds };

    // Tag meshes with their editable region so a long-press can raycast-pick one.
    M.hairTop.userData.region="top"; M.hairFringe.userData.region="fringe";
    M.hairSidesL.userData.region="sides"; M.hairSidesR.userData.region="sides";
    M.hairBack.userData.region="back"; M.sideburnsL.userData.region="sideburns";
    M.sideburnsR.userData.region="sideburns"; M.beard.userData.region="beard";
    M.hairCrown.userData.region="crown"; M.hairLayers.userData.region="layers";
    M.hairBangs.userData.region="bangs"; M.hairEnds.userData.region="ends";

    var lastState = null;
    var raycaster = new THREE.Raycaster();
    function pickRegion(cx, cy){
      var nx = (cx / window.innerWidth) * 2 - 1;
      var ny = -(cy / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera({ x:nx, y:ny }, camera);
      var targets = [];
      Object.keys(M).forEach(function(k){ var m=M[k]; if (m.userData.region && m.visible) targets.push(m); });
      var hits = raycaster.intersectObjects(targets, false);
      return hits.length ? hits[0].object.userData.region : null;
    }

    function highlight(m, on){
      m.material.emissive = new THREE.Color(on ? 0xe5a93c : 0x000000);
      m.material.emissiveIntensity = on ? 0.4 : 0;
    }

    function apply(state){
      var params = state.params || {};
      var men = state.gender === "men";
      var sel = state.selectedRegion;

      if (state.skinTone) head.material.color.set(state.skinTone);

      M.hairTop.visible = men; M.hairFringe.visible = men; M.hairSidesL.visible = men; M.hairSidesR.visible = men;
      M.hairBack.visible = men; M.sideburnsL.visible = men; M.sideburnsR.visible = men; M.beard.visible = men;
      M.hairCrown.visible = !men; M.hairLayers.visible = !men; M.hairBangs.visible = !men; M.hairEnds.visible = !men;

      function setLen(mesh, lengthCm, bx, by, bz, axis, key){
        var norm = Math.max(0.02, lengthCm/15);
        var f = 0.3 + norm*1.6;
        var sx = mesh.scale.x, sy = mesh.scale.y, sz = mesh.scale.z;
        if (axis==="x") sx = bx*f; if (axis==="y") sy = by*f; if (axis==="z") sz = bz*f;
        mesh.scale.set(sx,sy,sz);
        highlight(mesh, sel===key);
      }

      if (men){
        if (params.top) setLen(M.hairTop, params.top.lengthCm, 0.9,0.55,0.95, "y","top");
        if (params.fringe) setLen(M.hairFringe, params.fringe.lengthCm, 1.1,0.6,0.5, "z","fringe");
        if (params.sides){
          var n = Math.max(0.02, params.sides.lengthCm/8);
          M.hairSidesL.scale.set(0.35*(0.3+n*1.6),0.9,0.6);
          M.hairSidesR.scale.copy(M.hairSidesL.scale);
          highlight(M.hairSidesL, sel==="sides"); highlight(M.hairSidesR, sel==="sides");
          var fadeY = 0.05 - ((params.sides.fadeHeight||0)/100)*0.35;
          M.hairSidesL.position.y = fadeY; M.hairSidesR.position.y = fadeY;
        }
        if (params.back) setLen(M.hairBack, params.back.lengthCm, 0.9,0.7,0.55, "y","back");
        if (params.sideburns){
          var ns = Math.max(0.02, params.sideburns.lengthCm/5);
          M.sideburnsL.scale.set(1,0.5+ns*2,1); M.sideburnsR.scale.copy(M.sideburnsL.scale);
          highlight(M.sideburnsL, sel==="sideburns"); highlight(M.sideburnsR, sel==="sideburns");
        }
        if (params.beard){
          var nb = Math.max(0.02, params.beard.lengthCm/10);
          M.beard.scale.set(0.95,0.45*(0.3+nb*1.6),0.55);
          highlight(M.beard, sel==="beard");
        }
      } else {
        if (params.crown) setLen(M.hairCrown, params.crown.lengthCm, 1,0.65,1, "y","crown");
        if (params.layers){
          var nl = Math.max(0.05, params.layers.lengthCm/40);
          M.hairLayers.scale.set(1,0.4+nl*1.6,1); highlight(M.hairLayers, sel==="layers");
        }
        if (params.bangs){
          var nbg = Math.max(0.02, params.bangs.lengthCm/20);
          M.hairBangs.scale.set(1,0.4+nbg*1.5,1); highlight(M.hairBangs, sel==="bangs");
        }
        if (params.ends){
          var ne = Math.max(0.05, params.ends.lengthCm/80);
          M.hairEnds.scale.set(1,0.5+ne*2,1); M.hairEnds.position.y = -0.6 - ne*0.9;
          highlight(M.hairEnds, sel==="ends");
        }
        if (params.parting){
          var pos = ((params.parting.partingPos==null?50:params.parting.partingPos)/100) - 0.5;
          M.hairBangs.position.x = pos*0.6; highlight(M.hairBangs, sel==="parting");
        }
      }

      var gc = params.globalColor || "#1B1B1B";
      ["hairTop","hairFringe","hairSidesL","hairSidesR","hairBack","sideburnsL","sideburnsR","beard","hairCrown","hairLayers","hairBangs","hairEnds"].forEach(function(k){
        M[k].material.color.set(gc);
      });

      if (state.lighting === "warm"){ warm.intensity = 1.1; cool.intensity = 0.15; }
      else { warm.intensity = 0.35; cool.intensity = 1.0; }

      if (state.quickView){
        if (state.quickView==="front"){ T.ry=0; T.rx=0; }
        else if (state.quickView==="side"){ T.ry=Math.PI/2; T.rx=0; }
        else if (state.quickView==="back"){ T.ry=Math.PI; T.rx=0; }
        else if (state.quickView==="top"){ T.ry=0; T.rx=0.7; }
      }
    }

    // rotation / zoom targets + eased current
    var T = { ry:0, rx:0, zoom:1 };
    var C = { ry:0, rx:0, zoom:1 };

    // gestures: 1-finger drag = rotate, 2-finger = pinch zoom,
    // double-tap = reset, long-press (~400ms, no move) = pick region.
    var dragging=false, lastX=0, lastY=0, pinchDist=null, lastTap=0;
    var lpTimer=null, lpX=0, lpY=0, moved=false;
    var LONG_MS=400, MOVE_TOL=10;
    function clearLP(){ if(lpTimer){ clearTimeout(lpTimer); lpTimer=null; } }
    function dist(t){ var dx=t[0].clientX-t[1].clientX, dy=t[0].clientY-t[1].clientY; return Math.sqrt(dx*dx+dy*dy); }
    canvas.addEventListener("touchstart", function(e){
      var now=Date.now();
      if (now-lastTap < 280){ T.ry=0; T.rx=0; T.zoom=1; }
      lastTap=now;
      if (e.touches.length===2){ pinchDist=dist(e.touches); clearLP(); }
      else if (e.touches.length===1){
        dragging=true; lastX=e.touches[0].clientX; lastY=e.touches[0].clientY;
        lpX=lastX; lpY=lastY; moved=false;
        clearLP();
        lpTimer=setTimeout(function(){
          lpTimer=null;
          if (!moved){
            var r = pickRegion(lpX, lpY);
            if (r){ dragging=false; post({ type:"region", region:r }); }
          }
        }, LONG_MS);
      }
    }, {passive:true});
    canvas.addEventListener("touchmove", function(e){
      if (e.touches.length===2 && pinchDist!=null){
        clearLP();
        var d=dist(e.touches); var ratio=d/pinchDist;
        T.zoom = Math.min(2, Math.max(0.6, T.zoom*ratio)); pinchDist=d;
      } else if (e.touches.length===1 && dragging){
        var x=e.touches[0].clientX, y=e.touches[0].clientY;
        if (Math.abs(x-lpX) > MOVE_TOL || Math.abs(y-lpY) > MOVE_TOL){ moved=true; clearLP(); }
        T.ry += (x-lastX)*0.01; T.rx = Math.max(-0.8, Math.min(0.8, T.rx+(y-lastY)*0.006));
        lastX=x; lastY=y;
      }
    }, {passive:true});
    canvas.addEventListener("touchend", function(e){ clearLP(); if (e.touches.length===0){ dragging=false; pinchDist=null; } }, {passive:true});
    canvas.addEventListener("touchcancel", function(){ clearLP(); dragging=false; pinchDist=null; }, {passive:true});

    window.__update = function(state){ try { lastState = state; apply(state); } catch(err){ post({type:"error", reason:"apply:"+err.message}); } };

    window.addEventListener("resize", size);
    size();

    // Render loop with an explicit running flag so we can stop on context loss /
    // backgrounding and reliably resume afterwards.
    var running=true, scheduled=false;
    function tick(){
      scheduled=false;
      if (!running) return;
      C.ry += (T.ry-C.ry)*0.15; C.rx += (T.rx-C.rx)*0.15; C.zoom += (T.zoom-C.zoom)*0.15;
      root.rotation.y = C.ry; root.rotation.x = C.rx;
      camera.position.z = 5.4 / C.zoom; camera.lookAt(0,0,0);
      try { renderer.render(scene, camera); } catch(e){}
      schedule();
    }
    function schedule(){ if (!scheduled && running){ scheduled=true; requestAnimationFrame(tick); } }

    // Called by React Native on AppState -> active.
    window.__resume = function(){ running=true; if (lastState){ try { apply(lastState); } catch(e){} } size(); schedule(); };

    canvas.addEventListener("webglcontextlost", function(e){ e.preventDefault(); running=false; post({ type:"ctx_lost" }); }, false);
    canvas.addEventListener("webglcontextrestored", function(){
      running=true;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setClearColor(0x0a0a0a,1);
      size();
      if (lastState){ try { apply(lastState); } catch(e){} }
      schedule();
      post({ type:"ctx_restored" });
    }, false);
    document.addEventListener("visibilitychange", function(){ if (!document.hidden){ window.__resume(); } });

    schedule();
    post({ type:"ready" });
  }

  (function(){
    var s = document.createElement("script");
    s.src = "${THREE_CDN}";
    s.onload = boot;
    s.onerror = function(){ post({ type:"error", reason:"cdn_load_failed" }); };
    document.head.appendChild(s);
    // Safety timeout: if three never loads, report error so RN can fall back.
    setTimeout(function(){ if (!window.THREE){ post({ type:"error", reason:"timeout" }); } }, 6000);
  })();
</script>
</body>
</html>`;
}
