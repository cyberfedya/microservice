import { Express, Router } from "express";
import * as controller from './documents.controller';

export function registerDocumentRoutes(app: Express) {
    const router = Router();

    // Document List & Detail
    router.get('/', controller.getCorrespondences);
    router.get('/:id', controller.getCorrespondenceById);

    // Document Creation
    router.post('/incoming', controller.createIncomingCorrespondence);
    router.post('/outgoing', controller.createOutgoingCorrespondence);

    // Document Lifecycle Actions
    router.post('/:id/submit-review', controller.submitForReview);
    router.post('/:id/approve-review', controller.approveReview);
    router.post('/:id/reject-review', controller.rejectReview);
    router.post('/:id/sign', controller.signDocument);
    router.post('/:id/dispatch', controller.dispatchDocument);
    // router.post('/:id/hold', controller.holdCorrespondence);     // <--- Этих контроллеров нет!
    // router.post('/:id/cancel', controller.cancelCorrespondence);  // <--- Этих контроллеров нет!
    // router.post('/:id/delegate', controller.assignInternalEmployee); // <--- Этих контроллеров нет!


    // Document Management
    router.put('/:id/executors', controller.updateExecutors);
    router.put('/:id/deadline', controller.updateDeadline); // <-- Ошибка может указывать сюда, если предыдущие были неверны

    app.use('/api/correspondences', router);
}