// TEMPLATES: Plantillas predefinidas de flujos
function getTemplate(name) {
  const N = [];
  const E = [];
  const add = (t, tx, x, y) => {
    const n = createNode(t, tx, x, y);
    N.push(n);
    return n;
  };
  const link = (a, b, l) => E.push(createEdge(a.id, b.id, l, 'normal'));

  if (name === 'comparacion_precios') {
    // FLUJO DE IMPLEMENTACIÓN - PÁGINA COMPARACIÓN DE PRECIOS
    // 1. INICIO
    const start = add('start', 'Comparación Precios\nINICIO', 400, 30);
    start.status = 'done';

    // 2. OBJETIVOS
    const objTech = add('process', 'Obj. Técnicos:\n• Carga < 2s\n• Búsqueda < 500ms\n• Uptime 95%+\n• Tests 80%+', 80, 150);
    objTech.status = 'done';

    const objUx = add('process', 'Obj. UX:\n• Comparar < 30s\n• Mobile 95+\n• WCAG AA\n• Rating 4.5/5', 300, 150);
    objUx.status = 'done';

    const objBiz = add('process', 'Obj. Negocio:\n• 10K usuarios\n• 100K productos\n• 50 vendors\n• Retención 70%', 520, 150);
    objBiz.status = 'done';

    const objInteg = add('process', 'Obj. Integración:\n• FlowLab sync\n• Auth compartida\n• Design unificado\n• Estado central', 740, 150);
    objInteg.status = 'done';

    link(start, objTech, 'Técnico');
    link(start, objUx, 'UX');
    link(start, objBiz, 'Negocio');
    link(start, objInteg, 'Sync');

    // 3. FASES DE IMPLEMENTACIÓN
    const f1 = add('process', 'FASE 1: MVP\nSem 1-2 | 60h\n• Búsqueda básica\n• Tabla comparativa\n• API scaffold', 80, 320);
    f1.status = 'progress';
    f1.progress = 60;
    f1.current = true;

    const f2 = add('process', 'FASE 2: Core\nSem 3-4 | 80h\n• Filtros avanzados\n• Gráficos precio\n• Persistencia', 300, 320);
    f2.status = 'pending';

    const f3 = add('process', 'FASE 3: Advanced\nSem 5-6 | 100h\n• Alertas de precio\n• WebSocket live\n• Analytics', 520, 320);
    f3.status = 'pending';

    const f4 = add('process', 'FASE 4: Polish\nSem 7-8 | 60h\n• Performance\n• Mobile polish\n• Tests > 80%', 740, 320);
    f4.status = 'pending';

    link(objTech, f1, 'Reqs');
    link(objUx, f1, 'UX spec');
    link(objBiz, f1, 'Scope');
    link(objInteg, f1, 'Arch');

    link(f1, f2, 'MVP listo');
    link(f2, f3, 'Core listo');
    link(f3, f4, 'Adv listo');

    // 4. MÓDULOS Y FEATURES
    const feat = add('parallel', 'FEATURES:\nBúsqueda | Comparar\nAlertas | Live Prices\nVendors | Historial', 400, 480);
    link(f1, feat, 'Entrega');
    link(f2, feat, 'Expande');
    link(f3, feat, 'Completa');

    // 5. ARQUITECTURA E INTEGRACIÓN
    const arch = add('db', 'ARQUITECTURA:\nFrontend: Vanilla+Chart\nBackend: Express+PG\nCache: Redis\nRealtime: WS', 180, 620);
    const integ = add('api', 'INTEGRACIÓN FlowLab:\njs/features/price-comp/\nExtender STATE\nCSS: theme.css\nUI: FlowLab patterns', 620, 620);

    link(feat, arch, 'Tech');
    link(feat, integ, 'Sync');

    // 6. CONTROL DE CALIDAD Y DEPLOY
    const decOk = add('decision', '¿Tests > 80%\ny Perf < 2s?', 400, 750);
    link(arch, decOk, 'Build');
    link(integ, decOk, 'Integ');
    link(f4, decOk, 'Audit');

    const dep = add('hook', 'DEPLOY:\nDocker container\nCI/CD GitHub Actions\nSentry monitoring', 400, 890);
    link(decOk, dep, 'Sí (Aprobado)');

    const end = add('end', 'Página Comparación\nPUBLICADA ✓', 400, 1020);
    link(dep, end, 'En producción');

  } else if (name === 'orquestador') {
    const hook = add('hook', 'GitHub push', 300, 20);
    hook.status = 'done';
    const plan = add('ai', 'planificar tareas', 300, 150);
    plan.status = 'progress';
    plan.progress = 50;
    plan.current = true;
    const c1 = add('ai', 'generar código', 40, 280);
    c1.status = 'progress';
    c1.progress = 35;
    const c2 = add('ai', 'generar tests', 300, 280);
    const build = add('process', 'build+lint', 300, 410);
    const d2 = add('decision', '¿tests ok?', 300, 540);
    const dep = add('api', 'deploy', 300, 690);
    const mon = add('loop', 'monitoréo', 300, 820);
    const end = add('end', 'completo', 300, 970);
    link(hook, plan);
    link(plan, c1);
    link(plan, c2);
    link(c1, build);
    link(c2, build);
    link(build, d2);
    link(d2, dep);
    link(dep, mon);
    link(mon, end);
  } else if (name === 'web') {
    const s = add('start', 'inicio', 80, 40);
    s.status = 'done';
    const ia = add('ai', 'generar UI', 80, 170);
    ia.status = 'progress';
    ia.progress = 40;
    ia.current = true;
    const te = add('process', 'tests', 80, 300);
    const d2 = add('decision', '¿ok?', 80, 430);
    const dp = add('api', 'deploy', 80, 580);
    const en = add('end', 'publicado', 80, 730);
    link(s, ia);
    link(ia, te);
    link(te, d2);
    link(d2, dp);
    link(dp, en);
  } else if (name === 'contratacion') {
    const s = add('start', 'Recepción de CV', 250, 40);
    s.status = 'done';
    const iaFilter = add('ai', 'Filtrado IA de perfil', 250, 160);
    iaFilter.status = 'done';
    const d1 = add('decision', '¿Cumple perfil?', 250, 290);
    d1.status = 'progress';
    d1.current = true;
    const reject = add('end', 'Descartar candidato', 50, 430);
    const techInterview = add('human', 'Entrevista Técnica', 250, 430);
    const offer = add('process', 'Oferta económica', 250, 560);
    const onboard = add('process', 'Onboarding & Acceso', 250, 690);
    const endHire = add('end', 'Contratado ✓', 250, 820);

    link(s, iaFilter);
    link(iaFilter, d1);
    link(d1, techInterview, 'Sí');
    link(d1, reject, 'No');
    link(techInterview, offer);
    link(offer, onboard);
    link(onboard, endHire);
  } else if (name === 'personal') {
    const s = add('start', 'Plan Diario', 150, 40);
    s.status = 'done';
    const t1 = add('process', 'Revisar PRs y tareas', 150, 160);
    t1.status = 'progress';
    t1.progress = 50;
    t1.current = true;
    const t2 = add('ai', 'Asistente IA de código', 150, 290);
    const d = add('decision', '¿Completado?', 150, 420);
    const e = add('end', 'Día cerrado', 150, 550);
    link(s, t1);
    link(t1, t2);
    link(t2, d);
    link(d, e);
  } else if (name === 'complex') {
    const s = add('start', 'Inicio Pipeline', 300, 30);
    s.status = 'done';
    const par = add('parallel', 'División Paralela', 300, 140);
    par.status = 'done';
    const branchA = add('process', 'Procesar Datos A', 100, 260);
    branchA.status = 'done';
    const branchB = add('ai', 'Análisis IA B', 500, 260);
    branchB.status = 'progress';
    branchB.progress = 75;
    branchB.current = true;
    const merge = add('process', 'Sincronizar ramas', 300, 390);
    const loop = add('loop', 'Bucle Validación', 300, 520);
    const db = add('db', 'Guardar en BD', 300, 650);
    const end = add('end', 'Fin Pipeline', 300, 780);

    link(s, par);
    link(par, branchA);
    link(par, branchB);
    link(branchA, merge);
    link(branchB, merge);
    link(merge, loop);
    link(loop, db);
    link(db, end);
  } else {
    const a = add('start', 'inicio', 80, 40);
    a.status = 'done';
    const b = add('process', 'paso', 80, 170);
    b.status = 'progress';
    b.progress = 50;
    b.current = true;
    const c = add('decision', '¿ok?', 80, 300);
    const d = add('end', 'fin', 80, 450);
    link(a, b);
    link(b, c);
    link(c, d);
  }
  return { nodes: N, edges: E };
}
